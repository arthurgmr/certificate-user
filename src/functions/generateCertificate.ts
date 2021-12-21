
import chromium from "chrome-aws-lambda";
import path from 'path';
import handlebars from "handlebars";
import fs from "fs";
import dayjs from "dayjs";
import { S3 } from "aws-sdk";

import { document } from "../utils/dynamodbClient";

// Interface Request Body
interface ICreateCertificate {
  id: string;
  name: string;
  grade: string;
}

interface ITemplate {
  id: string;
  name: string;
  grade: string;
  date: string;
  medal: string;
}

const compileHandlebars = async function(data: ITemplate) {
  // get template file;
  const filePath = path.join(
    process.cwd(),
    "src",
    "templates",
    "certificate.hbs"
  );
  // read file to html;
  const html = fs.readFileSync(filePath, "utf-8")
  
  // compile file and put all variable received in the template;
  return handlebars.compile(html)(data);

}


export const handle = async (event) => {
  // get data
  const { id, name, grade } = JSON.parse(event.body) as ICreateCertificate;

  // verify exists user
  const response = await document
    .query({
      TableName: "users_certificates",
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: {
        ":id": id,
      }
    })
    .promise();

  const userAlreadyExists = response.Items[0];

  if(!userAlreadyExists) {
    // put in the table
    await document.put({
      TableName: "users_certificates",
      Item: {
        id,
        name,
        grade
      }
    }).promise();
  } 

  // get image and read to base64;
  const medalPath = path.join(process.cwd(), "src", "templates", "selo.png");
  const medal = fs.readFileSync(medalPath, "base64");

  const data: ITemplate = {
    date: dayjs().format("DD/MM/YYYY"),
    grade,
    name,
    id,
    medal
  }

  // generate certificate;
  // compile using handlebars;
  const content = await compileHandlebars(data);

  // change to pdf file;
  const browser = await chromium.puppeteer.launch({
    headless: true,
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath
  });

  const page = await browser.newPage();

  await page.setContent(content);

  const pdf = await page.pdf({
    format: "a4",
    landscape: true,
    path: process.env.IS_OFFLINE ? "certificate.pdf" : null,
    printBackground: true,
    preferCSSPageSize: true
  });

  await browser.close();

  // save in S3;
  const s3 = new S3();

  await s3
    .putObject({
      Bucket: "certificatepdf-nodejs",
      Key: `${id}.pdf`,
      ACL: "public-read",
      Body: pdf,
      ContentType: "application/pdf",
    })
    .promise();


  return {
    statusCode: 201,
    body: JSON.stringify({
      message: "Certificate created!",
      url: `https://certificatepdf-nodejs.s3.sa-east-1.amazonaws.com/${id}.pdf`
    }),
    headers: {
      "Content-Type": "application/json",
    },
  };
};