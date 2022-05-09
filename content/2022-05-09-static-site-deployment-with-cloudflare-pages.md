+++
title = "Deploy a static site with cloudflare pages"
date = 2022-05-09
[taxonomies]
tags = ["guide", "hosting", "website", "static"]
[extra]
summary = "Deploy a static website to cloudflare's pages platform for all the world to see"
+++

If there's one thing I love about technology, it's optimisation. Constantly refining and tweaking until you get things
to be just so.

That's really the essence of what this guide is. I'll leave optimising the site for later, but here we'll touch on
getting your static site deployed to cloudflare's edge network easily.

For the purposes of this guide I'm going to assume you know your way around `git` and software version control.

## Step 1 - choosing a site generator

Cloudflare pages supports a lot of site builders, even including vue, react, and nuxtjs. For the purposes of this build
I chose Zola, since it seemed close to things like Hugo and Jekyll, but with modern tooling and is backed by rust.

You can check out the full list of supported frameworks [here](https://developers.cloudflare.com/pages/framework-guides/).

If you'd like to read more about Zola, go ahead and check out [getzola.org](https://www.getzola.org/).

## Step 2 - Configuration

First ensure you actually have a site that builds locally. You don't need to commit the public folder to the repo -
cloudflare pages can do this for you.

If you need, follow along with Zola's guides on initting a new project and get something up and running. For reference,
the site you're reading right now is located at [github.com/alexogeny/spectacles](https://github.com/alexogeny/spectacles).

### Step 2a - create the project

Then navigate to [dash.cloudflare.com](https://dash.cloudflare.com) - create an account if you haven't already. Navigate
to pages in the sidebar and select `Create a project`. You need to:

- have a publicly hosted repository on github or gitlab
- connect your cloudflare account to your chosen git host

### Step 2b - configure build and deployment

Once connected, in the `Builds & Deployments` section, you need to ensure that you choose the following:

- production branch matches the main branch in github (usually main, primary, prime, trunk, or develop)
- the build command is `zola build`
- the build output directory is `/public`
- the root directory is `/` (change this to `/src` if you prefer using that structure)
- build comments on pull requests is enabled

This last step will allow cloudflare pages to post the pipeline result directly to your git repo so you can know whether
the pipeline passed without having to log into cloudflare.

### Step 2c - environment variables

Last of all, under `Environment variables`, ensure that `ZOLA_VERSION` is set to `0.14.0` - currently Cloudflare pages
does not support newer versions.

## Step 3 - Your first deployment

When you're ready to do a deployment, just push a change to your repo. For now it seems like you can't trigger them
manually, but that was fine for me since I had plenty of tweaks to make and typos to fix.

You should monitor the build from the cloudflare dashboard the first time as it will select a `_.pages.dev` URL for you
based on the repository name.

Once you have that subdomain, if you're not going to use a custom domain, then set the `base_url` in your `config.toml`:

```toml
# the url that the site is being built for
base_url = "https://<my-zola-site>.pages.dev
```

## Step 4 - Configuring a custom domain

Assuming all that went well, something you might want to do is add a custom domain to your new static site. This is
pretty easy to do, and I'm gonna go ahead and assume you've purchased a domain.

My domain is not with cloudflare, so I had to add the website in the cloudflare dashboard (you get one for free as a
regular user) and then set the nameservers at the registrar (these are provided by cloudflare).

Once your nameservers are set up and pointing to cloudflare, you should navigate to the DNS settings for your site
on the cloudflare dashboard. Create a new `CNAME` record with the `Name` being your custom domain and the `Content`
being the cloudflare pages site (`<my-zola-site>.pages.dev`) from earlier.

Once this propagates (it should be fast, even faster if you use the 1.1.1.1 dns) you'll be able to see your pages
site at your custom domain on the Internet. Tada!

## Step 5 - Optionally preview builds

If you're the kind of person to do pull requests on small projects (I'm not, but hey, whatever floats your boat) then
you can get preview builds for pull requests.

If you navigate to the cloudflare dashboard after pushing to a development branch, and navigate to the deployments tab,
you'll be able to see a full list of deployments. This will include previews. Each preview deployment will have a unique
number prepended to your cloudflare pages subdomain for the lifetime of the development branch that you're working on.
