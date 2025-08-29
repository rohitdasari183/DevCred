import React, { JSX, useEffect, useRef, useState } from "react";
import axios from "axios";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { toast } from "react-toastify";
import { FaCloudUploadAlt } from "react-icons/fa";

type VideoItem = {
  id: number;
  title: string;
  description?: string;
  video_file: string; // Full URL from backend
  uploaded_at: string;
};

const Videos: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);

  const playersRef = useRef<{ [key: number]: any }>({});

  const token = localStorage.getItem("token") || "";

  const fetchVideos = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/videos/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos(res.data);
      setFilteredVideos(res.data);
    } catch {
      toast.error("Failed to load videos");
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Filter videos when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredVideos(videos);
    } else {
      setFilteredVideos(
        videos.filter((v) =>
          v.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, videos]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file) {
      toast.warning("Please provide title and select a video file.");
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("video_file", file);

    try {
      await axios.post("http://localhost:8000/api/videos/", fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Video uploaded successfully!");
      setTitle("");
      setDescription("");
      setFile(null);
      fetchVideos();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleResetAll = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setSearchTerm("");
    setActiveVideoId(null);
    playersRef.current = {};
    fetchVideos(); // reload everything
  };

  return (
    <div className="relative min-h-screen pt-24 px-6 bg-gradient-to-br from-[#05060A] via-slate-950 to-[#0B1020] text-slate-100">
      {/* Ambient animated glows (non-interactive) */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-center text-4xl font-extrabold tracking-tight mb-8 bg-gradient-to-r from-cyan-300 via-emerald-300 to-fuchsia-300 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(34,211,238,0.25)]">
          Mentoring Videos
        </h2>

        {/* Upload Form - glass panel */}
        <div className="bg-slate-900/70 border border-slate-800 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] p-6 mb-10">
          <div className="flex items-center gap-3">
            {
              FaCloudUploadAlt({
                className:
                  "text-3xl text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]",
              }) as JSX.Element
            }
            <h3 className="text-xl font-semibold text-slate-200">
              Upload Mentoring Video
            </h3>
          </div>

          <form onSubmit={handleUpload} className="mt-5 grid grid-cols-1 gap-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="bg-slate-800/70 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description (optional)"
              className="bg-slate-800/70 border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition resize-y"
              rows={4}
            />
            {/* Fancy file input */}
            <div className="flex flex-wrap items-center gap-3">
              <label className="relative cursor-pointer">
                <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-black font-semibold bg-gradient-to-r from-cyan-400 to-fuchsia-500 shadow-[0_8px_30px_rgba(34,211,238,0.25)] hover:opacity-90 transition">
                  <span className="inline-block h-2 w-2 rounded-full bg-black/40" />
                  Choose Video (mp4)
                </span>
                <input
                  type="file"
                  accept="video/mp4"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
              {file && (
                <span className="text-sm text-slate-400 truncate max-w-[60%]">
                  Selected: {file.name}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl font-semibold text-black bg-gradient-to-r from-emerald-400 to-cyan-500 hover:opacity-90 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition"
              >
                {uploading ? "Uploading..." : "Submit"}
              </button>
              <button
                type="button"
                onClick={handleResetAll}
                className="px-5 py-2.5 rounded-xl font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800/60 transition"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            placeholder="Search videos by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          />
          <button
            onClick={handleResetAll}
            className="px-5 py-2.5 rounded-xl font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800/60 transition"
          >
            Reset
          </button>
        </div>

        {/* Video List */}
        <div className="space-y-10">
          <h3 className="text-lg font-semibold text-slate-300">Your Videos</h3>

          {filteredVideos.length === 0 ? (
            <div className="text-slate-400/80 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-6 text-center">
              No videos found.
            </div>
          ) : (
            filteredVideos.map((v) => (
              <div
                key={v.id}
                className="relative bg-slate-900/60 border border-slate-800 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] hover:shadow-[0_10px_50px_-10px_rgba(34,211,238,0.25)] transition overflow-hidden"
              >
                {/* Accent gradient bar */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-emerald-400 opacity-70" />

                {/* Video Player */}
                <div className="w-full max-w-3xl mx-auto rounded-xl overflow-hidden bg-black flex justify-center mt-5">
                  <Plyr
                    source={{
                      type: "video",
                      sources: [{ src: v.video_file, type: "video/mp4" }],
                    }}
                    options={{
                      controls: [
                        "play",
                        "progress",
                        "current-time",
                        "mute",
                        "volume",
                        "fullscreen",
                      ],
                    }}
                    ref={(el: any) => {
                      if (el) playersRef.current[v.id] = el.plyr;
                    }}
                    onPlay={() => {
                      Object.keys(playersRef.current).forEach((id) => {
                        if (Number(id) !== v.id) {
                          playersRef.current[Number(id)].pause();
                        }
                      });
                      setActiveVideoId(v.id);
                    }}
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "80vh",
                    }}
                  />
                </div>

                {/* Video Info */}
                <div className="w-full max-w-3xl mx-auto p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-semibold text-xl text-slate-100">
                      {v.title}
                    </h4>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border ${
                        activeVideoId === v.id
                          ? "border-emerald-400/40 text-emerald-300 bg-emerald-300/10"
                          : "border-slate-700 text-slate-400 bg-slate-800/60"
                      }`}
                    >
                      {activeVideoId === v.id ? "Playing" : "Idle"}
                    </span>
                  </div>

                  {v.description && (
                    <p className="text-sm text-slate-300/90 mt-2 leading-relaxed">
                      {v.description}
                    </p>
                  )}

                  <div className="text-xs text-slate-400 mt-3">
                    {new Date(v.uploaded_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Videos;
