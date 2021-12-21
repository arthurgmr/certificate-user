<h1 align="center">Serverless</h1>

<p align="center">
  <img alt="License" src="https://img.shields.io/static/v1?label=license&message=MIT&color=8257E5&labelColor=000000">

<br>

## ✨ Technologies

This project was developed with the following technologies: 

- [Node.js](https://nodejs.org/en/)
- [Typescript](https://www.typescriptlang.org/)
- [Serverless Framework](serverless.com/)
- [Amazon Lambda](https://aws.amazon.com/pt/lambda/)

## 💻 Project

The project was developed in the [Rocketseat](https://www.rocketseat.com.br/) Node.js Bootcamp. It's possible to generate and validate the certificate for users.

## 🚀 How to execute

- Clone the repository

### To run local

- Run `yarn` to install dependencies
- Run `serverless dynamodb install` to install local DynamoDB
- Run `yarn dynamo:start` to initiate local database
- Run, in another terminal, the `yarn dev` to initiate local app

### To deploy

- Set all user credentials
- Run `yarn deploy` to up the project for AWS Lambda
