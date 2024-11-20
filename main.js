const fs = require('fs').promises;
const axios = require('axios');
const path = './config.json';

async function createOrder(eventId, ticketClassId) {
    const response = await axios.post('https://www.evbqaapi.com/v3/orders/create/?expand=questions,survey,registration_form', {
        "tickets": [
            {
                "ticket_class_id": ticketClassId,
            }
        ],
        "affiliate_code": "oddtdtcreator",
        "application": "embedded_web",
        "event_id": eventId,
        "waitlist_code": null,
        "is_eventbrite_tld": true    
    });

    return response;
}

async function updateOrder(order, attendees) {
    const response = await axios.post(`https://www.evbqaapi.com/v3/orders/${order.id}/`, {
        "order": {
          "answers": [
            {
              "attendee_id": null,
              "question_id": "N-first_name",
              "answer": "Rafa"
            },
            {
              "attendee_id": null,
              "question_id": "N-last_name",
              "answer": "Gonz"
            },
            {
              "attendee_id": null,
              "question_id": "N-email",
              "answer": "rafaelg@evbqa.com"
            }
          ],
          "is_post_checkout_mandatory_questions_enabled": false,
          "delivery_methods": [
            {
              "attendee_id": attendees[0].id,
              "delivery_method": "electronic"
            }
          ]
        }
    });

    return response;
}

async function placeOrder(orderId) {
    const response = await axios.post(`https://www.evbqaapi.com/v3/orders/${orderId}/place/?expand=ticket_buyer_settings`, {
        "accept_tos_order": false
    });
    
    return response;
}

async function main() {
    const failureInitialSleep = 10; // seconds
    let failureSleep = failureInitialSleep;
    try {
        const data = await fs.readFile(path, 'utf8');
        const config = JSON.parse(data);

        const { number_of_orders, sleep, api_key, event_id, ticket_class_id } = config;

        axios.defaults.headers.post['Authorization'] = 'Bearer ' + api_key;

        for (let i = 0; i < number_of_orders; i++) {
            try {
                let orderResponse = null;
                orderResponse = await createOrder(event_id, ticket_class_id);
                failureSleep = failureInitialSleep;

                const order = orderResponse.data.order;
                const attendees = orderResponse.data.attendees;
                await updateOrder(order, attendees);
                await placeOrder(order.id);
                console.log('Order placed: #' + order.id);
                await new Promise(resolve => setTimeout(resolve, sleep));
            } catch (error) {
                if ([307, 429, 500].includes(error.response.status)) {
                    const message = {
                        307: 'waiting room enabled',
                        429: 'rate limit exceeded',
                        500: 'internal server error'
                    }
                    console.log(`Error: ${error.response.status} (${message[error.response.status]}), Waiting ${failureSleep} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, failureSleep * 1000));
                    i--;
                    failureSleep *= 2;
                    continue;
                }
                else {
                    throw error;
                }
            }
        }
    } catch (err) {
        console.error("Error reading JSON file:", err);
    }
}

// Run the main function
main();
