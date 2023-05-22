import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ddb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class TodoInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //DDB table to store the tasks
    const table = new ddb.Table(this, "Tasks", {
      partitionKey: { name: "task_id", type: ddb.AttributeType.STRING},
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: "tt1",ls /workspace/CRUD-APP,
    });

    //GSI based on user_ID
    table.addGlobalSecondaryIndex({
      indexName: "user-index",
      partitionKey: {name: "user_id", type: ddb.AttributeType.STRING},
      sortKey: {name: "created_time", type: ddb.AttributeType.NUMBER},
    });

    //Lambda function for the API
    const api = new lambda.Function(this, "API", {
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset("../api/lambda_function.zip"),
      handler: "todo.handler",
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    //URL to access the function
    const functionUrl = api.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
        allowedHeaders: ["*"],
        allowedMethods: [lambda.HttpMethod.ALL],
      }
    });

    // Output the API function url.
    new CfnOutput(this, "APIUrl", {
      value: functionUrl.url,
    });

    table.grantReadWriteData(api); //grant lambda the access to ddb: read/write
  }
}
