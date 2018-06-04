var express = require('express');
var router = express.Router();
const config = require("../config.json");

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

module.exports = router;


// My Code
const Discord = require('discord.js');
const five = require('johnny-five');
const mic = require('mic');
const FFT = require('fft.js');
const board = new five.Board();
const d3 = require('d3-array');
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
    client.login(config.token);

    client.on('voiceStateUpdate', (oldMember, newMember) => {
        let micInstance = mic({
            rate: '16000',
            channels: '1',
            debug: true
        });
        let micInputStream = micInstance.getAudioStream();
        if (newMember.id === config.member_id)
        {
            if (newMember.voiceChannel != null) //We're in the channel
            {
                console.log('inVoiceChannel');
                micInputStream.on('data', function (data) {
                    console.log("Received input stream: " + data.length);
                    const f = new FFT(Math.pow(2, Math.ceil(Math.log(data.length)/Math.log(2))));
                    const out = f.createComplexArray();
                    f.realTransform(out, data);
                    let width = Math.ceil(out.length / 8);
                    var col;
                    var outMatrix = new Array();
                    for (var i = 0; i < 8; i++)
                    {
                        outMatrix[i] = new Array('0','0','0','0','0','0','0','0');
                    }
                    for (col = 0; col < 8; col++)
                    {
                        var index = 0;
                        var avg = 0;
                        for (index = col*width; index < (col+1)*width; index++)
                        {
                            avg += out[index];
                        }
                        avg = ((avg/width)/255)*8;
                        for (index=0;index<=avg;index++)
                        {
                            outMatrix[col][index] = '1';
                        }
                    }
                    for (i = 0; i < 8; i++)
                    {
                        outMatrix[i] = outMatrix[i].join("");
                    }
                    matrix.draw(outMatrix);
                });
                micInstance.start();
            }
            else //We're not in the channel
            {
                console.log('outVoiceChannel');
                matrix.clear();
                console.log('stopping mic');
                micInstance.stop();
            }
        }
    })

    /*
    client.on('message', async msg => {
        if (msg.content.startsWith(config.prefix+'join')) {
            if (!msg.guild) {
                return msg.reply('no private service is available in your area at the moment. Please contact a service representative for more details.');
            }
            if (msg.member.voiceChannenl){
                const voiceChannel = msg.member.voiceChannel;
                console.log(voiceChannel.id);
                if (!voiceChannel || voiceChannel.type !== 'voice') {
                    return msg.reply(`I couldn't find the channel...`);
                }
                voiceChannel.join().then(conn => {
                    msg.reply('ready!');
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
        if(msg.content.startsWith(config.prefix+'leave')) {
            let [command, ...channelName] = msg.content.split(" ");
            let voiceChannel = msg.member.voiceChannel;
            voiceChannel.leave();
        }
    });
    */
});


