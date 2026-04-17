import "dotenv/config";
import { app } from "./app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Swagger UI  →  http://localhost:${PORT}/swagger`);
  console.log(`ReDoc       →  http://localhost:${PORT}/redoc`);
});
