const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Device Fleet Monitor running on port ${PORT}`);
});