import express, { json } from 'express';
import cors from 'cors'
import mercadopago from 'mercadopago';
import request from 'request';

const app = express();

app.use(cors({ origin: '*' }));
app.use(json())

app.post('/generar', async (req, res) => {
    // Crea un objeto de preferencia
    let preference = {
        back_urls: {
            success: 'http://localhost:3000/success'
        },
        items: [
            {
                title: "Mi producto",
                unit_price: req.body.price,
                quantity: 1,
                currency_id: "ARS",
            },
        ],
        // notification_url: 'https://misitio/server'
    };

    mercadopago.preferences.create(preference)
        .then((response) => {
            // res.send(`<div>${JSON.stringify(response.body, null, 4)}</div><a href="${response.body.init_point}">IR A PAGAR</a>`);
            // En esta instancia deberás asignar el valor dentro de response.body.id por el ID de preferencia solicitado en el siguiente paso
            res.json({ link: response.body.init_point })
        })
        .catch((error) => {
            console.log(error);
        });



});

app.post('/data', (req, res) => res.json({ link: req.body }))

app.use('/success', (req, res) => {
    res.send('TODO SALIO BIEN')
})

// Agrega credenciales
mercadopago.configure({
    // INGRESAR TOKEN
    access_token: "APP_USR-743201864000985-041223-687991e5c9053ecb79f5332d1d795909-366379713",
});




//IMPLEMENTACION DE API DE PAYPAL
const clientId = 'AXYzuKmYH9O2XFjcQD0c5mqEeC_dZEpEqg1Yb9_2Km5HziNNiZpP7DxFWDIfP-e6Gs8OOSrFx50WVHCo';
const clientSecret = 'EDACidqNr6qTeU9HAIygNq1664iutHGKDjt_q6Bs_wQcTqp8joCq6rM5hba01maMqMdTpTQzw9ORkjMO';
const baseUrl = 'https://api.sandbox.paypal.com'; // Cambiar a 'https://api.paypal.com' en producción

// Ruta para crear un pago
app.post('/create-payment', (req, res) => {
    const payment = {
        intent: 'sale',
        payer: {
            payment_method: 'paypal'
        },
        redirect_urls: {
            return_url: 'http://localhost:3000/success', // URL de retorno en caso de éxito
            cancel_url: 'http://localhost:3000/cancel' // URL de retorno en caso de cancelación
        },
        transactions: [
            {
                amount: {
                    total: req.body.price, // Monto del pago
                    currency: 'USD' // Moneda del pago
                },
                description: 'Ejemplo de pago con PayPal' // Descripción del pago
            }
        ]
    };

    request.post(
        `${baseUrl}/v1/payments/payment`,
        {
            auth: {
                user: clientId,
                pass: clientSecret
            },
            body: payment,
            json: true
        },
        (error, response, body) => {
            if (error) {
                res.status(500).send({ error: 'Error al crear el pago' });
            } else {
                res.json({ link: body.links.find(link => link.method === 'REDIRECT').href });
            }
        }
    );
});

// Ruta para ejecutar un pago
app.get('/execute-payment/:paymentId/:payerId', (req, res) => {
    const paymentId = req.params.paymentId;
    const payerId = req.params.payerId;

    request.post(
        `${baseUrl}/v1/payments/payment/${paymentId}/execute`,
        {
            auth: {
                user: clientId,
                pass: clientSecret
            },
            body: { payer_id: payerId },
            json: true
        },
        (error, response, body) => {
            if (error) {
                res.status(500).send({ error: 'Error al ejecutar el pago' });
            } else {
                res.send({ payment: body });
            }
        }
    );
});



app.listen(process.env.PORT || 3000, () => console.log('Server on port', process.env.PORT || 3000))
