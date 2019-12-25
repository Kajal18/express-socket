const mongo = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const client = require('socket.io').listen(4000).sockets;
const cors = require('cors');
const express = require('express');

const app = express();

app.use(cors);

mongo.connect('mongodb://127.0.0.1/mongochat', function (err, db) {
    if (err) {
        throw err;
    }
    client.on('connection', (socket) => {
        let chat = db.collection('chats')
        sendStatus = (s) => {
            socket.emit('Status', s)
        }

        chat.find().limit(100).sort({ _id: 1 }).toArray((err, res) => {
            if (err) console.log(err)

            socket.emit('output', res)
        });

        socket.on('input', (data) => {
            let name = data.name
            let message = data.message

            if (name === '' || message === '') {
                sendStatus('Please enter name and message')
            } else {
                chat.insert({ name, message }, (data) => {
                    client.emit('output', data)

                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    })
                })

            }

        });

        socket.on('cleared', (data) => {
            chat.remove({}, () => {
                socket.emit('')
            })
        });
    })
    console.log('Mongodb connected....')
});