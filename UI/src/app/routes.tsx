import { createBrowserRouter, Navigate } from "react-router";
import { MainLayout } from "./components/MainLayout";
import { CreateMusic } from "./pages/CreateMusic";
import { MusicEdit } from "./pages/MusicEdit";
import { Library } from "./pages/Library";
import { CreateSpeech } from "./pages/CreateSpeech";
import { Pricing } from "./pages/Pricing";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, element: <Navigate to="/create-music" replace /> },
      { path: "create-music", Component: CreateMusic },
      { path: "music-edit", Component: MusicEdit },
      { path: "library", Component: Library },
      { path: "create-speech", Component: CreateSpeech },
      { path: "pricing", Component: Pricing },
    ],
  },
]);
