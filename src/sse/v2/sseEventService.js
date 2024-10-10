import EventEmitter from 'events';
import _ from "lodash";
import logger from '../../lib/logger/index.js'; // Assuming you have a logger utility

class SseEvent extends EventEmitter {
    constructor(initial, options = {}) {
        super();

        this.initial = initial || []; // Initialize with provided data or an empty array
        this.options = !_.isEmpty(options) ? { ...options } : { isSerialized: true }; // Set options with defaults

        this.init = this.init.bind(this);
    }

    /**
     * The SSE route handler. Sets up the SSE connection and handles data streaming.
     * @param {Object} req - The HTTP request object.
     * @param {Object} res - The HTTP response object.
     */
    init(req, res) {
        let id = 0;

        logger.info('Initializing SSE connection'); // Log the initiation of the SSE connection

        req.socket.setTimeout(0);
        req.socket.setNoDelay(true);
        req.socket.setKeepAlive(true);

        res.statusCode = 200;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        if (req.httpVersion !== '2.0') {
            res.setHeader('Connection', 'keep-alive');
        }

        if (this.options.isCompressed) {
            res.setHeader('Content-Encoding', 'deflate');
        }

        this.setMaxListeners(this.getMaxListeners() + 2); // Increase the number of event listeners

        const dataListener = data => {
            if (data.id) {
                res.write(`id: ${data.id}\n`);
            } else {
                res.write(`id: ${id}\n`);
                id += 1;
            }

            if (data.event) {
                res.write(`event: ${data.event}\n`);
            }

            res.write(`data: ${JSON.stringify(data.data)}\n\n`);
            logger.info(`Sent data to SSE: ${JSON.stringify(data.data)}`); // Log the sent data
        };

        const serializeListener = data => {
            const serializeSend = data.reduce((all, msg) => {
                all += `id: ${id}\ndata: ${JSON.stringify(msg)}\n\n`;
                id += 1;
                return all;
            }, '');
            res.write(serializeSend);
            logger.info(`Serialized data sent to SSE: ${serializeSend}`); // Log serialized data
        };

        this.on('data', dataListener);
        this.on('serialize', serializeListener);

        if (this.initial) {
            if (this.options?.isSerialized) {
                this.serialize(this.initial);
            } else if (!_.isEmpty(this.initial)) {
                this.send(this.initial, this.options.initialEvent || false, this.options.eventId);
            }
        }

        req.on('close', () => {
            this.removeListener('data', dataListener);
            this.removeListener('serialize', serializeListener);
            this.setMaxListeners(this.getMaxListeners() - 2);
            logger.info('SSE connection closed, removed listeners'); // Log connection close event
        });
    }

    /**
     * Update the data initially served by the SSE stream.
     * @param {Array} data - Array containing data to be served on new connections.
     */
    updateInit(data) {
        this.initial = data;
        logger.info(`Updated initial data for SSE: ${JSON.stringify(data)}`); // Log data update
    }

    /**
     * Empty the data initially served by the SSE stream.
     */
    dropInit() {
        this.initial = [];
        logger.info('Dropped initial data for SSE'); // Log data drop
    }

    /**
     * Send data to the SSE.
     * @param {(Object|string)} data - Data to send into the stream.
     * @param {string} [event] - Event name.
     * @param {(string|number)} [id] - Custom event ID.
     */
    send(data, event, id) {
        this.emit('data', { data, event, id });
        logger.info(`Data sent: ${JSON.stringify(data)}, Event: ${event}, ID: ${id}`); // Log sent data details
    }

    /**
     * Send serialized data to the SSE.
     * @param {Array} data - Data to be serialized as a series of events.
     */
    serialize(data) {
        if (Array.isArray(data)) {
            this.emit('serialize', data);
            logger.info(`Serializing data: ${JSON.stringify(data)}`); // Log serialization process
        } else {
            this.send(data);
        }
    }
}

export default SseEvent;
