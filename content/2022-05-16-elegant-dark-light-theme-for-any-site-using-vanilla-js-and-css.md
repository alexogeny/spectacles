+++
title = "Creating an Elegant Dark/Light Theme Chooser"
date = 2022-05-16
[taxonomies]
tags = ["guide", "website", "js", "css"]
[extra]
summary = "Create an elegant dark/light theme selector for any website with vanilla js + css"
+++

# Preamble

I find there aren't many things more annoying on the internet than a website that doesn't have a native dark mode (and
worse yet the ones that default to light mode even if you've set a dark system theme and they have a dark mode).

I understand the contrast of a light mode is better for people who are colorblind but can we all just take a moment to
accept that for the majority of people with eyeballs, light mode as the default sucks.

In this guide I'm going to show you a simple and elegant way to create your own dark/light theme picker / chooser /
toggler / selector / insert_name_here on your site. I am going to cover system mode detection as well, which is pretty
straightforward to add nowadays (so more sites should do it!).

We're going to use vanilla HTML, CSS, and JS. No frameworks and no external dependencies required! I'll be calling it a
`toggler` internally since I'm just toggling the lights on and off.

# Step 1 - creating the picker element

For the picker element, we just need a simple `a` tag that we can change the content of. We're going to fix it on the
screen so that it doesn't scroll with any other elements and is always accessible from anywhere on the page.

```html
<a style="cursor:pointer" id="themeToggler" class='theme__toggler' onclick="toggleTheme()"></a>
```

You'll notice that it's an `a` tag without a `href`. You can use anything here, really, just not a `span`. We've set up
several important properties that we'll cover in the next step:

- the `id` isn't strictly speaking needed, but I like to have this prop on anything that triggers js
- the `theme__toggler` class will change the appearance of the toggler when the js is called
- `toggleTheme()` function that fires when we click the toggler

# Step 2 - add the css variables for the themes

Let's figure out what we're going to do with our theme. For the sake of simplicity, I'm just going to do the body and
background colors here. This is what the css will look like for the dark and light color themes:

```css
:root {
  --color--background: #f9f9f9;
  --color--text: #333333;
}

[data-theme="dark"] {
  --color--background: #242424;
  --color--text: #d7d7d7;
}

* {
  transition: color .2s ease-in, background-color .2s ease-in;
}

```

Basically these are the colors I've used on this site. We set the variables to the lighter colors, and then we define
a `data-theme` for dark mode. You could add other themes here, but for this simple blog I only wanted light and dark.

We've also added a global transition for the light and dark change, just to make it a bit easier on the eyes when you
click the toggler.

# Step 3 - style the toggler

Next thing we need to do is settle on an icon for the toggler. I chose a moon for the reason that it's neat and conveys
the idea. Let's go back and update our css and add some theming for the toggler itself:

```css
:root {
  --theme: "🌔";
}

[data-theme="dark"] {
  --theme: "🌒";
}

.theme__toggler {
  position: fixed;
  right: 25px;
  bottom: 25px;
  font-size: 40px;
}

.theme__toggler:after {
  content: var(--theme);
}
```

What we've done here is set the content `:after` the theme toggler to be the selected emoji of the theme, in this case
a gibbous and crescent. Whether they're waxing or waning depends on your mindset.

# Step 4 - adding the js

The toggler isn't doing to do anything until we actually define our JS function, though. As a primer, we'll use local
storage instead of a cookie (so we don't need any notices about storing cookies) and the data is first party. We'll need
a function for toggling the theme, a function for changing the theme attribute on the document element, and then we'll
also need to call the theme manually on first page load (so that when you refresh it preserves your settings).

And since I'm on a static site, it's so fast you don't notice it. We'll also call it early on in the document so that
the styles are updated before the browser has had time to do its first paint.

## Step 4a - checking which theme is set

```js
const checkTheme = () => localStorage.getItem('theme') ? localStorage.getItem('theme') : 'dark'
```

We call `localStorage` the first time to see if a theme is set. If it's not undefined, we call it a second time to
return the value, or we default to dark. Doing it this way means we can have an elegant one-liner that doesn't have to
span multiple lines or deal with the undefined case (I initially did this and it broke on first click).

If you want to fall back to the system selected mode, use this code instead:

```js
function checkTheme () {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return localStorage.getItem('theme') ? localStorage.getItem('theme') : prefersDark ? 'dark' : 'light'
}
```

The difference here being you just need to check whether the `prefers-color-scheme: dark` media query returns true. We
still want to first return the user setting if it is set.

## Step 4b - toggling the theme

Now we need some code for toggling the theme between our options. Since we're just picking between two themes, we can
do a simple flip. If you have multiple themes, you'll need something to actually select the theme based on the user's
selection.

```js
function toggleTheme () {
  const theme = checkTheme()
  const newTheme = theme === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', newTheme)
  setTheme(newTheme)
}
```

We call our `checkTheme` function from earlier, then reverse it in the `newTheme` variable. Then we set the
`localStorage` `theme` variable to our `newTheme`. Then we call a function called `setTheme` which we'll need to define.

## Step 4c - setting the theme on the root element

The reason we're doing this as a separate function is because we also need to call it on document initialization, before
the browser has painted anything. This gives you a seamless load of your selected theme without a transition on every
page load.

```js
const setTheme = (theme) => document.documentElement.setAttribute('data-theme', theme)
```

Here we're simply passing in a `theme` and setting the `data-theme` attribute on the root element.

## Step 4d - activating the theme on page load

The last step we need is to actually set the theme on pageload, which we do like so:

```js
setTheme(checkTheme())
```

# Step 5 - hooking it all up

The last thing we need to do is actually load the JS on the page. So go ahead and add the usual `script` tag to your
setup:

```html
<script src="<your asset folder>/theme.js" type="text/javascript"></script>
```

I'm going to assume that you know how to host files properly.

# the result

![](/content/theme.gif)
