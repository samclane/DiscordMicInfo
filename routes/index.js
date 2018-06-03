var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

module.exports = router;

const Discord = require('discord.js');
const five = require('johnny-five');
const board = new five.Board();
board.on("ready", function() {
    let matrix = new five.Led.Matrix({
        pins: {
            data: 2,
            clock: 3,
            cs: 4
        },
        devices: 1
    });
    matrix.clear();
    let heart = [
        "01100110",
        "10011001",
        "10000001",
        "10000001",
        "01000010",
        "00100100",
        "00011000",
        "00000000"
    ];
    const client = new Discord.Client();

    client.on('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`);
    });

    client.on('message', msg => {
        if (msg.content === 'ping') {
            msg.reply('pong');
        }
    });
    client.login('MjMyMjE5MjY0NDI0MjE0NTI4.DfXVCw.vAFi_UC8VG7in9cohCbTXeHBQYA');

    client.on('message', async msg => {
        if (msg.content.startsWith('/join')) {
            if (!msg.guild) {
                return msg.reply('no private service is available in your area at the moment. Please contact a service representative for more details.');
            }
            if (msg.member.voiceChannel){
                const voiceChannel = msg.member.voiceChannel;
                console.log(voiceChannel.id);
                if (!voiceChannel || voiceChannel.type !== 'voice') {
                    return msg.reply(`I couldn't find the channel...`);
                }
                voiceChannel.join().then(conn => {
                    msg.reply('ready!');
                    const receiver = conn.createReceiver();
                    conn.on('speaking', (user, speaking) => {
                        if (speaking) {
                            console.log('speaking');
                            matrix.draw(heart);
                        } else {
                            console.log('clear');
                            matrix.clear();
                        }
                    });
                })
            } else {
                message.reply('You need to join a voice channel first!');
            }
        }
        if(msg.content.startsWith('/leave')) {
            let [command, ...channelName] = msg.content.split(" ");
            let voiceChannel = msg.member.voiceChannel;
            voiceChannel.leave();
        }
    });
});


