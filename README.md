# Smart To Do App

## Business rule

- [ ] Create and update project and tasks by AI

- [ ] Report generation by AI

- [ ] User can communicate with AI by voices (STT & TTS)

- [ ] Users can collaborate

- [ ] Project owner can manage privilege on shared projects

- [ ] OAuth2.0 with google provider for authentication

- [ ] Send notification via a users

- [ ] No admin for this system

## Tech stack

- [ ] PostgreSQL

- [ ] Sequelize

- [ ] Ollama

- [ ] LangChain + LangGraph

- [ ] Node mailer

- [ ] Passport.js + Google OAuth 2.0

- [ ] STT + TTS

- [ ] GraphQL APIs

- [ ] Express + Apollo Server + TypeScript

- [ ] React + Apollo Client + Tail Wind

- [ ] Expo + Apollo Client + Native Wind

## Database schema:

### Users

* id

* email

* name

* avatar

* provider

* provider id

### Projects

* id

* title

* owner id

* description

* priority: `1 - 5`

* urgent important matrix:  `urgent & important | urgent & not important | not urgent & important | not urgent & not important`

* success criteria

* is public

* start date

* end date

* status: `todo | in progress | done`

* completed at

### Tasks

- id

- project id

- title

- description

- status: `todo | in progress | done`

- order_weight

- due date

- completed at

### Subtasks

- id

- task id

- title

- description

- status: `todo | in progress | done`

- order_weight

- due date

- completed at

### Project Members

- id

- project id

- user id

- role: `admin | editor | viewer`

### Project History

- id

- project id

- entity type: `project | task`

- entity id

- change type: `create | update | delete | status change`

- change summary

- changed by

### AI Interaction

- id

- user id

- parent interaction id

- project id

- prompt

- response

- action type: `create | edit | report`

- metadata

### Common attributes for all models

- created at

- updated at

- is deleted

- deleted at
