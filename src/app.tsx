import "./index.css"; // import css

import * as React from "react";
import { createRoot } from "react-dom/client";
import Table from "./components/Table";

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(<Table></Table>);
