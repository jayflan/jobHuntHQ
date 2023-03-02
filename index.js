const app = require("./app");
// console.log(app)
const port = process.env.PORT || 3000;

const init = () => {
  app.listen(port, ()=> console.log(`listening on port ${port}`));
};

init();