import express, { json } from 'express';
import cors from 'cors'
import mercadopago from 'mercadopago';

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
    access_token: "",
});



app.listen(process.env.PORT || 3000, () => console.log('Server on port', process.env.PORT || 3000))
