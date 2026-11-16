---
layout: home
hero:
  name: Jarvis
  text: Personal AI development agent
  tagline: Task in chat → context → spec → plan → code → checks → review → draft PR → CI and review follow-up. Runs Claude only through the claude CLI on the subscription.
  actions:
    - theme: brand
      text: Read the spec
      link: /specs/abstract-project-spec
    - theme: alt
      text: Architecture
      link: /architecture/
    - theme: alt
      text: Presentation
      link: https://burnjohn.github.io/jarvis-agent/
      target: _self
features:
  - title: Specs
    details: What Jarvis does and why, with acceptance criteria.
    link: /specs/
  - title: Architecture
    details: Engine, web app, Postgres, deployment and the claude CLI process model.
    link: /architecture/
  - title: Decisions
    details: ADRs that constrain the code, each with checkable confirmation rules.
    link: /decisions/architecture/
  - title: Plans
    details: Implementation plans, phase by phase.
    link: /plans/iteration-1
  - title: Running Jarvis
    details: How to run it locally and on the server.
    link: /running
  - title: Webinar
    details: The concept behind the presentation.
    link: /webinar/webinar-concept
---
