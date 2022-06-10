+++
title = "Resume"
template = "resume.html"
paginate_by = 0
+++

<div class="noprint">
  <a onClick="window.print();" style="cursor:pointer">🖨️ Print this resume</a>
</div>

## alex mcneill

<div class="print">{{ rev(content="ynegoxela") }}</div>
<div class="print">This resume is available online: {{ external(title="https://alexogeny.dev/resume", source="https://alexogeny.dev/resume") }}</div>

## bio

I am a highly skilled software engineer with many talents. My core passion lies in complex problem solving and delivering elegant yet practical and pragmatic solutions.

I'm a lifelong learner and feel like a day not spent learning is a day wasted. When I'm not problem solving or learning you'll find me helping out my coworkers and contributing to the team wherever possible.

Outside of work you'll find me playing tennis, reading a book, or obsessing over the latest limited release craft beer(s).

## soft skills

- I have a strong work ethic
- I am a critical thinker &amp; problem solver
- I communicate frequently and listen actively
- I show empathy and value an inclusive team culture
- I value diversity and different perspectives

## engineering skills

#### Scripting &amp; Deployment

- **Python**, fluent, {{ exp(id="python", y=2011) }}
- **Ansible**, nearly fluent, {{ exp(id="ansible", y=2021) }}
- **Docker**, advanced, {{ exp(id="docker", y=2020) }}
- **CI (github actions, gitlab ci)**, advanced, {{ exp(id="ci", y=2018) }}
- **APIs (rest, gql)**, advanced, {{ exp(id="apis", y=2014) }}
- **Automation engineering (mocha, cypress)**, advanced, {{ exp(id="automation", y=2015) }}
- **Cloudformation**, intermediate, {{ exp(id="cloudformation", y=2021) }}

#### Frontend

- **Nodejs**, fluent, {{ exp(id="nodejs", y=2016) }}
- **Typescript**, fluent, {{ exp(id="typescript", y=2016) }}
- **React &amp; Redux**, fluent, {{ exp(id="react", y=2016) }}
- **Prisma**, intermediate, {{ exp(id="prisma", y=2022) }}

#### Backend &amp; Databases

- **PostgreSQL**, fluent, {{ exp(id="postgres", y=2014) }}
- **GraphQL**, fluent, {{ exp(id="graphql", y=2021) }}
- **PHP &amp; Laravel**, fluent, {{ exp(id="php", y=2011) }}

## experience

**intelliHR**, Software Engineer, {{ workexp(id="intelli", start=2021, end=0) }}

- engineering across the full stack (front, back, pipelines, design, &amp; testing)
- agile ceremonies (standups, technical breakdowns, retrospectives, kickoffs, planning)
- continuous improvement across all aspects &amp; leaving repos better than I found them
- continuous patching of packages and systems (renovate bot is now standard across our repos)
- implementation of advanced pipelines in gitlab ci (dynamic deployments, scheduled deployments, etc.)
- exposure to cloud infra via aws (including au and eu) and k8s orchestration with cloudformation
- a/b releasing with feature flags
- extensive creation of documentation and usage of collaborative tools
- championed DX by introducing deployment repositories for developer quick start

**AIRBUS**, Reliability Analyst, {{ workexp(id="airbus", start=2017, end=2021) }}

- process automation and pipeline development
- data visualisation and modelling for presentation to important stakeholders
- sensitive data management (requiring security clearance)
- continuous improvement of tooling and systems

**Best Practice Australia**, Web Developer, {{ workexp(id="bpa", start=2014, end=2017) }}

- full stack development
- systems administration including active directory, windows server, linux server, &amp; licensing
- overhauling legacy systems

### education

**Data Analytics**, Graduate Certificate, QUT, 2021

**IT &amp; Corporate Systems Management**, Bachelor, QUT, 2014

### references

on request
