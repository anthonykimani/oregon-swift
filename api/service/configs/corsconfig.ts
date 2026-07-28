import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[],
  methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 200,
  credentials: true,
};

export default corsOptions;
