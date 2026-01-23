import { runWebhookErrorTest, runWebhookSuccessTest } from './src/app/actions/system-test'

async function runCallback() {
    console.log('--- Running Webhook Error Test ---')
    const errorResult = await runWebhookErrorTest()
    console.log('Error Test Result:', errorResult)

    console.log('\n--- Running Webhook Success Test ---')
    const successResult = await runWebhookSuccessTest()
    console.log('Success Test Result:', successResult)
}

runCallback()
