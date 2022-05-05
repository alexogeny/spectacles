+++
title = "Encrypted Pop OS install with Luks, Lvm, Btrfs"
date = 2022-05-04
[taxonomies]
tags = ["guide", "linux", "btrfs", "encryption"]
[extra]
summary = "Fresh install Pop_OS! using Luks and LVM to encrypt. Use the Btrfs filesystem."
+++

In this post I will go through the steps required to successfully install Pop_OS! with an encrypted Luks+LVM setup.
Alongside this we'll configure Btrfs with reasonable defaults.


Upon the completion of the guide you should have a fully encrypted setup that's performant and has enriched your
understanding of how to install linux systems.

As with most shells, the `$` throughout this guide indicates any time that you'll be inputtting text. Where a shell
line is not preceeded by `$` or is preceeded by a `#`, that's usually an output.

I originally ready through [this guide by Willi Mutschler](https://mutschler.eu/linux/install-guides/pop-os-btrfs-20-04/)
but noticed a distinct lack of explanations and human-readable language, so here I'm translating it into lay person
language, adding my own spin on it, and also modifying it to fit Pop_OS! 22.04 updates, now that Ubuntu 22.04 is out
for general public use.

## Step 1 - booting up

Boot onto the usb media via UEFI (boot menu is usually `F12` or `F11`, or you can use `Del` then access the boot menu)
and then execute the following command in a new terminal prompt (leave the installer window open):

```bash
$ sudo -i
```

This will save us having to do a `sudo` for virtually every command from here on out.

## Step 2 - Preparing for Partitioning, Luks, LVM, and Btrfs

Use the `lsblk` command to show the disks and their storage blocks available on the system:

```bash
$ lsblk
NAME            MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
sda               8:0    0   1.8T  0 disk
sdb               8:16   1     0B  0 disk
nvme0n1         259:0    0 931.5G  0 disk
├─nvme0n1p1     259:1    0   512M  0 part  /boot/efi
└─nvme0n1p2     259:2    0   931G  0 part
  └─cryptdata   253:0    0   931G  0 crypt
    └─data-root 253:1    0   931G  0 lvm   /home
                                           /
```

What we're looking for is the drive where we intend to install the system. You'll usually know which one this is
because it'll match the size of your boot drive.

In my case, the `sda` drive is a spinning HDD and the `sdb` is the USB media. And I know my system has a 1TB Corsair
Force MP600 NVME SSD, so by process of elimination it has to be `nvme0n1`. So for the remainder of this guide I'll be
using that to do drive-related commands.

If your drive is different, just replace `nvme0n1` with whatever your device name is.

Once we've completed section 2, the partition layout should look like the following:

1. 512MiB bootloader partition (efi)
2. luks2 encrypted partition of the remaining space

You can see that in the above snapshot (the G is lower because a GiB is not the same as a G). Yay math.

Anyway, some choices you should be aware of:

I have over 16GB RAM in my system and I use an SSD, so I elect not to use a swap partition. Swap is essentially a way
for the system to page memory onto the disk when it runs out of space. Not only does this reduce the life of your SSD,
but generally speaking it's unnecessary as RAM gets cheaper and larger in capacity.

I don't use a backup partition or any backup software. All the work I do is either on my NAS which has an unRAID array
with two parity disks, or it's on a hosted git service like GitHub or GitLab, or both. This guide will not provide you
with a solution for backing up.


```bash
$ parted /dev/nvme0n1

$ mklabel gpt # confirm yes

$ mkpart primary fat32 1MiB 512MiB # boot partition

$ mkpart primary 513MiB 100% # encrypted partition

$ name 1 EFI # label

$ name 2 POPOS # label

$ set 1 esp on # enable boot via UEFI
```

What we've done here:

1. Loaded the partition software `parted` with the disk param (in my case `nvme0n1`)
2. Erased the partition label and made a new GPT label
3. Made a 512MiB boot partition to store our bootloader on
4. Created a partition with the remainder of the drive space to store our stuff
5. Labelled both the partitions
6. Enabled booting via UEFI by setting ESP to on for the boot partition

The resulting output looks something like this:


```bash
$ unit MiB print
Model: Force MP600 (nvme)
Disk /dev/nvme0n1: 953870MiB
Sector size (logical/physical): 512B/512B
Partition Table: gpt
Disk Flags:

Number  Start    End        Size       File system  Name   Flags
 1      1.00MiB  513MiB     512MiB     fat32               boot, esp
 2      514MiB   953869MiB  953355MiB               POPOS
```

### Step 2a - Luks

Now we're going to actually create the encrypted volume. For this step you should choose a password that is unique to
you, hard to guess, and long (at least 20 characters).

Try to choose something that isn't identifiable or can't be socially engineered from that Facebook account you only
check once a month.

```bash
$ cryptsetup luksFormat /dev/nvme0n1p2
WARNING!
========
This will overwrite data on /dev/nvme0n1p2 irrevocably.
Are you sure? (Type uppercase yes): YES # living on the edge baby
Enter passphrase for /dev/nvme0n1p2:
Verify passphrase:
```

Woop! You created an encrypted volume! Now let's go ahead and open it and then see what the mapper shows us:

```bash
$ cryptsetup luksOpen /dev/nvme0n1p2 cryptdata
Enter passphrase for /dev/nvme0n1p2:

$ ls /dev/mapper
control cryptdata
```

Note the `p2` here - we're doing this in the _second_ partition we made for our data, and not the first partition which
will be used for the bootloader.

### Step 2b - LVM

LVM - logical volume management - is fairly straightforward in principle. In essence, it allows you to manage volumes
_logically_.

That is, you can do things flexibly, like adding disk space while a filesystem is mounted and in use. Or perhaps you
want to create a single volume from multiple physical disks. Many possibilities!

We're going to ignore that though and basically just create a logical volume inside the encrypted partition we set up
in the previous step.

```bash
$ pvcreate /dev/mapper/cryptdata
Physical volume "/dev/mapper/cryptdata" successfully created

$ vgcreate data /dev/mapper/cryptdata
Volume group "data" successfully created

$ lvcreate -n root -l 100%FREE data
Logical volume "root" created.

$ ls /dev/mapper/
control cryptdata data-root

$ cryptsetup luksClose /dev/mapper/data-root

$ cryptsetup luksClose /dev/mapper/cryptdata

$ ls /dev/mapper
control
```

Essentially what we've done here is:

1. created a virtual physical volume inside our encrypted partition
2. made a group for that volume called 'data'
3. created a logical volume inside that group for the root filesystem with all the free space
4. we did a `ls` to check that our data-root logical volume exists
5. and then we unmounted the volumes and confirmed with a `ls` (so only `control` is visible)

## Step 3 - actually installing Pop_OS!

Run the Pop_OS! installer window that you left open from before (keep the terminal window open, we'll need it later)
and choose `Custom (Advanced)`.

1. On the first partition (the one we'll be using for the bootloader), select: `Use partition` and `Format`. Select
`Boot /boot/efi` and make sure the filesystem is `fat32`.
2. On the second partition, click it, and a `Decrypt` prompt will appear. Enter the password you used to set up the
encrypted partition from before and it should reveal a new `LVM Data` line underneath.
3. Select the new `LVM data` line, select `use partition`, and select the `format` option. Format as `root (/)` and
ensure that the filesystem is set to `btrfs`.
4. Select the `Erase and install` and watch the magic happen.
5. Do NOT reboot after finishing. Quit the installer. We'll be going back to the terminal window we left open from
before.

## Step 4 - Post Pop_OS! installer

Now let's do stuff to set up Btrfs!

### Step 4a - mount the root filesystem

First thing we need to do is mount the encrypted data.

```bash
$ cryptsetup luksOpen /dev/nvme0n1p2 cryptdata
Enter passphrase for /dev/nvme0n1p2 # same password as before
mount -o subvolid=5,ssd,noatime,commit=120,compress=zstd:4,discard=async /dev/mapper/data-root /mnt
```

What we've done here is:

1. Decrypted the encrypted partition we set up before
2. Mounted the `data-root` logical volume to `/mnt` using the following options:
    * `subvolid=5` - the default subvolume ID
    * `ssd` - optimized behavior to preserve the life of SSD disks
    * `noatime` - don't store the last access time on disk. This will further help save your SSD, and is also generally
      faster. And you gotta ask yourself about the last time you cared when you opened a file was.
    * `commit=120` - Btrfs uses a cache system to write data to the disk, and by default it does this every 30 seconds.
      I find that to be a bit aggressive so I set it to two minutes. If you're freaking out now, here's some sage
      advice: commit and commit often.
    * `compress=zstd:4` - Btrfs has native support for disk level compression. It can use several libraries and `zstd`
      seems to be pretty performant. I've set it to `4` instead of the default `3` for a bit of extra compression. `3`
      will be the best of size and speed if you _really_ don't care.
    * `discard=async` - very technical, but essentially: when the filesystem was discarding, it originally did it
      synchronously during transaction commits to the drive. What this means: performance issues if you have a lot
      of data to commit. This flag enables the discarding to be done _asynchronously_. The work by the system is the
      same, but it makes the system appear more responsive to you. If you're like me and do a lot of work with lots of
      large docker images and volumes, keep this to `async`.

### Step  4b - Create the required Btrfs sub-volumes

Now let's go ahead and create the two subvolumes we'll need:

```bash
$ btrfs subvolume create /mnt/@
Create subvolume '/mnt/@'

$ cd /mnt

$ ls | grep -v @ | xargs mv -t @ #move all files and folders to /mnt/@

$ ls -a /mnt
. .. @

$ btrfs subvolume create /mnt/@home
Create subvolume '/mnt/@home'

$ mv /mnt/@/home/* /mnt/@home/

$ ls -a /mnt/@/home
. ..

$ ls -a /mnt/@home
. .. alexogeny

$ btrfs subvolume list /mnt
ID 264 gen 339 top level 5 path @
ID 265 gen 340 top level 5 path @home
```

Take some time with the above commands. First time I did it I set up the sub volume incorrectly and couldn't save any
data to my user's home folder. Funny, not funny! The reason is because I didn't link the subvolumes properly (I did
`/mnt/@/home` instead of `/mnt/@home`).

Essentially what we've done here is create two top level `btrfs` sub volumes - `@` and `@home` - `home` being the usual
spot where we store all our user data.

### Step 4c - Update fstab

We need to make sure that we update the `fstab` so that the system knows where our filesystems are and how to mount
them.

```bash
$ sed -i 's/btrfs  defaults/btrfs defaults,subvol=@,ssd,noatime,commit=120,compress=zstd,discard=async/' /mnt/@/etc/fstab

$ echo "UUID=$(blkid -s UUID -o value /dev/mapper/data-root) /home btrfs defaults,subvol=@home,ssd,noatime,commit=120,compress=zstd,discard=async 0 0" >> /mnt/@/etc/fstab
```

Basically with the first line we've told the system that the root partition should be loaded using the sane defaults
we want for our `btrfs` system.

The second line we've made the system aware of our `@hoem` sub volume (so that we can load our home dir later!).

To check we did it correctly, let's `cat` it:

```bash
$ cat /mnt/@/etc/fstab
# /etc/fstab: static file system information.
#
# Use 'blkid' to print the universally unique identifier for a
# device; this may be used with UUID= as a more robust way to name devices
# that works even if disks are added and removed. See fstab(5).
#
# <file system>  <mount point>  <type>  <options>  <dump>  <pass>
PARTUUID=20128939-e836-409a-bb3c-eebe69e6046a  /boot/efi  vfat  umask=0077  0  0
UUID=3738efe0-7616-4bed-8251-4814319492c2  /  btrfs  defaults,subvol=@,ssd,noatime,commit=120,compress=zstd:3,discard=async  0  0
UUID=3738efe0-7616-4bed-8251-4814319492c2 /home btrfs defaults,subvol=@home,ssd,noatime,commit=120,compress=zstd:3,discard=async 0 0
```

Note that your `UUID`s here may differ - this should be unique to your system. Notice that the `UUID` should be the same
for the `/home` subvolume though - because we're mounting the same _logical_ volume but directing `btrfs` to mount with
the `subvol=@home` flag.

We also need to make `crypttab` aware of our decision to perform discards asynchronously. `crypttab` performs a similar
function to `fstab` but for making the system aware of any encryption schemes in use on disks:

```bash
$ sed -i 's/luks/luks,discard/' /mnt/@/etc/crypttab
```

Let's check we got what we expected:

```bash
$ cat /mnt/@/etc/crypttab
cryptdata UUID=4c8ae398-6c0a-4cbb-a013-5a524fc22338 none luks,discard
```

Basically we've just let the system know that the encrypted partition is making use of asynchronous discards.

### Step 4d - update the bootloader

Now we need to let the bootloader know about all of our newfangled changes! So let's go ahead and do that. First, mount
the efi partition:

```bash
$ mount /dev/nvme0n1p1 /mnt/@/boot/efi
```

Then we should update the current configuration to include the root subvolume we created (`@`). Do this with `nano` and
add ` rootflags=subvol=@` at the end of the last line. Your `Pop_OS-current.conf` should look something like this after
updating:

```bash
$ cat /mnt/@/boot/efi/loader/entries/Pop_OS-current.conf
title Pop!_OS
linux /EFI/Pop_OS-3738efe0-7616-4bed-8251-4814319492c2/vmlinuz.efi
initrd /EFI/Pop_OS-3738efe0-7616-4bed-8251-4814319492c2/initrd.img
options root=UUID=3738efe0-7616-4bed-8251-4814319492c2 ro quiet loglevel=0 systemd.show_status=false splash rootflags=subvol=@
```

We also need to add this flag to the kernel options (so the linux kernel knows where our sub volume is). Add
`rootflags=subvol=@` to the user kernel options:

```bash
$ cat /mnt/@/etc/kernelstub/configuration
...
  "user": {
    "kernel_options": [
      "quiet",
      "loglevel=0",
      "systemd.show_status=false",
      "splash",
      "rootflags=subvol=@"
    ],
  }
...
```

Note that I've made use of `...` above to denote parts of the file that aren't really relevant. What matters is that
in the user options we've added the `rootflags=subvol=@` line.

### Step 4e - update initramfs

`initramfs` is the first filesystem that comes online when our system boots. Therefore, we need to make sure it's aware
of the changes we've made so that the system can successively boot into our sub volumes.

First let's mount the actual file system from our install:

```bash
$ cd /

$ umount -l /mnt

$ mount -o defaults,subvol=@,ssd,noatime,commit=120,compress=zstd:3,discard=async /dev/mapper/data-root /mnt

$ for i in /dev /dev/pts /proc /sys /run; do mount -B $i /mnt$i; done

$ chroot /mnt

$ mount -av
/boot/efi                : already mounted
/                        : ignored
/home                    : already mounted
```

Cool! We've got our `/boot/efi`, the root filesystem at `/` which is ignored, and our `/home` volume!

Now let's run the `update-initramfs` command and reboot:

```bash
$ update-initramfs -c -k all

$ exit
exit

$ reboot now
```

We've instructed the initramfs to look for new updates and update its configuration accordingly. Then we've exited the
current shell and told the system to reboot.

## Step 5 - get into Pop_OS! and start doing the fun stuff

After the reboot, open the terminal and check the following

```bash
$ sudo mount -av
/boot/efi                : already mounted
/                        : ignored
/home                    : already mounted
```

Neat! So we have our `efi` and `home` partition mounted proper. You'll know if this worked because if you go through
the initial user setup and it saves your changes.

If you select "dock doesn't extend to edges" and it defaults back to
"dock extends to edges" you probably had a typo in one of the steps above.

```bash
$ sudo mount -v | grep /dev/mapper
/dev/mapper/data-root on / type btrfs (rw,noatime,compress=zstd:3,ssd,discard=async,space_cache=v2,commit=120,subvolid=256,subvol=/@)
/dev/mapper/data-root on /home type btrfs (rw,noatime,compress=zstd:3,ssd,discard=async,space_cache=v2,commit=120,subvolid=257,subvol=/@home)
```

And if you haven't forked [my deployment repository](https://github.com/alexogeny/freckles), you may want to enable the
filesystem trim timer if you're running on an SSD:

```bash
sudo systemctl enable fstrim.timer
```

## Step 6 - Update the ssytem and reboot

Now we just need to do cleanups and system updates!

### Step 6a - Regional mirrors

First thing, you should make sure that your system sources point to your region.

```bash
$ sudo cat /etc/apt/sources.list.d/system.sources
X-Repolib-Name: Pop_OS System Sources
Enabled: yes
Types: deb deb-src
URIs: http://us.archive.ubuntu.com/ubuntu/
Suites: jammy jammy-security jammy-updates jammy-backports
Components: main restricted universe multiverse
X-Repolib-Default-Mirror: http://us.archive.ubuntu.com/ubuntu/
```

If you live in the US, great! Nothing to do! But if you're like me and live in Australia or another part of the world,
you'll need to update this to use your region's servers. Well, not _need_ to, but you _should_, so you can get stuff
faster and more efficiently (saving the planet, and all, one byte at a time).

```bash
sudo sed -i 's|http://us.|http://au.|' /etc/apt/sources.list.d/system.sources
```

Basically we just replace the `us` subdomain with the region we live in. In my case, `au`.

### Step 6b - LibreOffice

Now let's go ahead and remove `libreoffice`. Note that if you actually have a need for office software (for some reason)
I'd advise against this:

```bash
sudo apt purge libreoffice*
```

### Step 6c - Locale

Then let's go ahed with locale info:

```bash
sudo locale-gen en_US.UTF.8
sudo update-locale LANG=en_US.UTF-8
```

In your region settings click `Manage Installed Languages`. Ignore any prompts to update.

Then click `Install/Remove languages`.

Uncheck anything you don't plan on using.

For reference, I've selected English, Japanese, German, and Korean.

But DO NOT update. First close this window to save your prefs, then reopen and do the updates it asks for.

This will then automagically uninstall locales you don't need.

### Step 6d - General Updates

Once that's out the way, we can actually update packages:

```bash
sudo apt update && sudo apt upgrade -y && sudo apt autoremove -y && sudo apt autoclean -y
```

### Step 6e - Extra packages

The latest 22.04 install of Pop_OS! (and maybe Ubuntu 22.04) makes some strange choices.

For instance, you'll need to run the following if you want easy screenshot software:

```bash
sudo apt install gnome-screenshot
```

And there still isn't default video recording software, so you'll need to:

```bash
sudo apt install peek
```

## Step 7

Well it's not really a step, but I just wanted to say thanks for reading this through. That was a lot of guide and if
you made it this far you must be really dedicated to the craft and want to do something better with your system.

Hopefully you learned a lot and maybe you did end up setting up your own encrypted Pop_OS! install!

If you had any issues with the guide, please feel free to submit a Pull Request on
[the repo](https://github.com/alexogeny/spectacles) where this guide is located.

If you have any comments or questions, [reach out on twitter](https://twitter.com/alexogeny).

<br/>
<br/>
<br/>


Thanks and happy popping!
