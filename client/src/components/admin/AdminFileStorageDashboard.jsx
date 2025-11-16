import React, { useEffect, useState } from "react";
import { storage } from "../../firebase";
import {
  listAll,
  ref,
  getMetadata,
  deleteObject,
} from "firebase/storage";

export default function AdminFileStorageDashboard() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalBytes, setTotalBytes] = useState(0);
  const [deleting, setDeleting] = useState(null);

  /** ---------------------------------------------------------
   * Load all files from /listings/
   * --------------------------------------------------------- */
  const loadFiles = async () => {
    setLoading(true);

    try {
      const baseRef = ref(storage, "listings");
      const list = await listAll(baseRef);

      const fileData = [];

      for (const itemRef of list.items) {
        try {
          const meta = await getMetadata(itemRef);
          fileData.push({
            name: meta.name,
            fullPath: meta.fullPath,
            size: meta.size || 0,
            updated: meta.updated || "",
            contentType: meta.contentType || "",
          });
        } catch (err) {
          console.error("Metadata load failed:", err);
        }
      }

      // Sort by most recent update
      fileData.sort((a, b) => new Date(b.updated) - new Date(a.updated));

      setFiles(fileData);

      // compute total bytes
      const total = fileData.reduce((sum, f) => sum + f.size, 0);
      setTotalBytes(total);
    } catch (err) {
      console.error("Storage list error:", err);
      alert("Failed to load storage files — see console.");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadFiles();
  }, []);

  /** ---------------------------------------------------------
   * Delete a file
   * --------------------------------------------------------- */
  const handleDelete = async (fullPath) => {
    if (!window.confirm("Delete this file permanently?")) return;

    try {
      setDeleting(fullPath);
      await deleteObject(ref(storage, fullPath));
      await loadFiles();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed — check console.");
    } finally {
      setDeleting(null);
    }
  };

  /** ---------------------------------------------------------
   * Helpers
   * --------------------------------------------------------- */

  const formatSize = (bytes) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
  };

  return (
    <div className="space-y-8">

      {/* -----------------------------------------------------
         Storage Usage Summary
      ------------------------------------------------------ */}
      <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Firebase Storage Usage</h2>
          <p className="text-sm text-gray-600">
            All files stored under <code>/listings/</code>
          </p>
        </div>

        <div className="text-right">
          <p className="text-3xl font-bold">{formatSize(totalBytes)}</p>
          <p className="text-gray-500 text-sm">total usage</p>
        </div>
      </div>

      {/* -----------------------------------------------------
         File Table
      ------------------------------------------------------ */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 border-b">
            <tr>
              <th className="py-3 px-4 text-left">File Name</th>
              <th className="py-3 px-4 text-left">Path</th>
              <th className="py-3 px-4">Size</th>
              <th className="py-3 px-4">Updated</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="py-6 text-center" colSpan="5">
                  Loading…
                </td>
              </tr>
            ) : files.length === 0 ? (
              <tr>
                <td className="py-6 text-center" colSpan="5">
                  No files found in storage.
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr key={file.fullPath} className="border-b last:border-none">
                  <td className="py-3 px-4">
                    <span className="font-medium">{file.name}</span>
                  </td>

                  <td className="py-3 px-4 text-gray-500">
                    {file.fullPath}
                  </td>

                  <td className="py-3 px-4 text-center">
                    {formatSize(file.size)}
                  </td>

                  <td className="py-3 px-4 text-center">
                    {new Date(file.updated).toLocaleDateString()}{" "}
                    {new Date(file.updated).toLocaleTimeString()}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      disabled={deleting === file.fullPath}
                      onClick={() => handleDelete(file.fullPath)}
                      className={`px-3 py-1 rounded text-white ${
                        deleting === file.fullPath
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {deleting === file.fullPath ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
