// Server creation and configuration
const http = require("node:http");
const app = require("./src/app");
const { default: pool } = require("./src/config/db");

// Config .env
require("dotenv").config();

// Server creation
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT);

// Listeners
server.on("listening", async () => {
    console.log(`Server listening on port ${PORT}`);

    try {
        const connection = await pool.getConnection();
        console.log('Conexión a la base de datos MySQL exitosa!');
        connection.release();
    } catch (error) {
        console.error('Error conectando a la base de datos:', error.message);
    }    
});

server.on("error", (error) => {
    console.log(error);
});
