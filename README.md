# Graphcool Templates 📗

**Use Graphcool [templates](https://docs-next.graph.cool/reference/service-definition/templates-zeiv8phail) to quickly pull in predefined functionality into your own Graphcool service.**

## Overview

###  Officially supported templates

We maintain a number of officially supported templates:

- [auth](./auth): Templates for different authentication mechanisms, such as [email-password](./auth/email-password) or [facebook](./auth/facebook).
- [messaging](./messaging): Templates to quickly integrate with different messaging services, such as [mailgun](./messaging/mailgun) (emails), [pusher](./messaging/pusher) (push notifications) or [twilio](./messaging/twilio) (SMS).

### Outdated templates

Notice that the [outdated](./outdated) templates are _not_ officially supported. Right now, most of the templates inside the [outdated](./outdated) directory are not working when used with the [`graphcool add-template`](https://docs-next.graph.cool/reference/graphcool-cli/commands-aiteerae6l#add-template) command!

### Contributions

Contributions are _highly_ welcome :green_heart: if you'd like to add a new template, you can get inspiration from the [help wanted label](https://github.com/graphcool/templates/labels/help%20wanted), or suggest your own template!

## Adding templates to your service

There are two ways how you can use a template in your service:

1. Manually download and copy the code from a template directory in this repository. 
2. Use the [`add-template`](https://docs-next.graph.cool/reference/graphcool-cli/commands-aiteerae6l#add-template) command from the [CLI](!alias-zboghez5go).

### Option 1: Manually adding templates

The process of adding a template to a Graphcool service involves several steps. You're basically _merging_ your local service definition with the service definition of the template you want to use. In the end, you end up with only _one_ `graphcool.yml` as well as only _one_ `types.graphql`.

Adding a template manually:

1. Download the folder that contains the service definition of the template you want to use.
2. Copy that folder into the root directory of your Graphcool service.
3. Copy over the contents from the template's `graphcool.yml` into the `graphcool.yml` of your own service. Be sure to adjust any file references, e.g. source files that contain code for [functions](https://docs-next.graph.cool/reference/functions/overview-aiw4aimie9), if necessary.
4. Copy over the contents from the template's `types.graphql` into the `types.graphql` of your own service. 
5. Deploy your changes with `graphcool deploy`.

### Option 2: Adding templates with the CLI

The `add-template` command in the Graphcool CLI basically automates the process of [manually adding templates](#option-1-manually-adding-templates). 

Official templates can be added by providing their relative path in this repository, e.g. for the [`email-password`](https://github.com/graphcool/modules)-template:

```sh
graphcool add-template auth/email-password
```

To install your own templates, you can provide the path to a GitHub repository, too: 

```sh
graphcool add-template graphcool/templates/auth/email-password
```

When merging the template's `graphcool.yml` and `types.graphql` files with the ones from your local service definition, the CLI will only add the contents from the template files into your local files _as comments_. So **you need to explicitly uncomment the parts form the template files that you actually want to use in your service**.

The process for using the CLI to add a template thus looks as follows:

1. Use the `add-template <path>` CLI command and specify the `<path>` which points to the template's directory in this repository.
2. Uncomment the lines in `graphcool.yml` and `types.graphql`.
3. Deploy your changes with `graphcool deploy`.

## Contributors

A big thank you to all contributors and supporters of this repository 💚

<a href="https://github.com/marktani/" target="_blank">
  <img src="https://github.com/marktani.png?size=64" width="64" height="64" alt="marktani">
</a>
<a href="https://github.com/yusinto/" target="_blank">
  <img src="https://github.com/yusinto.png?size=64" width="64" height="64" alt="yusinto">
</a>
<a href="https://github.com/kuldar/" target="_blank">
  <img src="https://github.com/kuldar.png?size=64" width="64" height="64" alt="kuldar">
</a>
<a href="https://github.com/heymartinadams/" target="_blank">
  <img src="https://github.com/heymartinadams.png?size=64" width="64" height="64" alt="heymartinadams">
</a>
<a href="https://github.com/pbassut/" target="_blank">
  <img src="https://github.com/pbassut.png?size=64" width="64" height="64" alt="pbassut">
</a>
<a href="https://github.com/kbrandwijk/" target="_blank">
  <img src="https://github.com/kbrandwijk.png?size=64" width="64" height="64" alt="kbrandwijk">
</a>
<a href="https://github.com/dkh215/" target="_blank">
  <img src="https://github.com/dkh215.png?size=64" width="64" height="64" alt="dkh215">
</a>
<a href="https://github.com/sorenbs/" target="_blank">
  <img src="https://github.com/sorenbs.png?size=64" width="64" height="64" alt="sorenbs">
</a>
<a href="https://github.com/petrvlcek/" target="_blank">
  <img src="https://github.com/petrvlcek.png?size=64" width="64" height="64" alt="petrvlcek">
</a>
<a href="https://github.com/mwickett/" target="_blank">
  <img src="https://github.com/mwickett.png?size=64" width="64" height="64" alt="mwickett">
</a>
<a href="https://github.com/katopz/" target="_blank">
  <img src="https://github.com/katopz.png?size=64" width="64" height="64" alt="katopz">
</a>
<a href="https://github.com/randomer/" target="_blank">
  <img src="https://github.com/randomer.png?size=64" width="64" height="64" alt="randomer">
</a>
<a href="https://github.com/picosam/" target="_blank">
  <img src="https://github.com/picosam.png?size=64" width="64" height="64" alt="picosam">
</a>
<a href="https://github.com/antho1404/" target="_blank">
  <img src="https://github.com/antho1404.png?size=64" width="64" height="64" alt="antho1404">
</a>
<a href="https://github.com/BoraKilicoglu/" target="_blank">
  <img src="https://github.com/BoraKilicoglu.png?size=64" width="64" height="64" alt="BoraKilicoglu">
</a>
<a href="https://github.com/peterpme/" target="_blank">
  <img src="https://github.com/peterpme.png?size=64" width="64" height="64" alt="peterpme">
</a>
<a href="https://github.com/Gregor1971/" target="_blank">
  <img src="https://github.com/Gregor1971.png?size=64" width="64" height="64" alt="Gregor1971">
</a>
<a href="https://github.com/jhalborg/" target="_blank">
  <img src="https://github.com/jhalborg.png?size=64" width="64" height="64" alt="jhalborg">
</a>
<a href="https://github.com/felipesabino/" target="_blank">
  <img src="https://github.com/felipesabino.png?size=64" width="64" height="64" alt="felipesabino">
</a>
<a href="https://github.com/iamclaytonray/" target="_blank">
  <img src="https://github.com/iamclaytonray.png?size=64" width="64" height="64" alt="iamclaytonray">
</a>

## Help & Community [![Slack Status](https://slack.graph.cool/badge.svg)](https://slack.graph.cool)

Say hello in our [Slack](http://slack.graph.cool/) or visit the [Graphcool Forum](https://www.graph.cool/forum) if you run into issues or have questions. We love talking to you!

![](http://i.imgur.com/5RHR6Ku.png)
