"use client";
import { useState, useEffect, useRef } from 'react';
import { FileText, Download, Upload, Eye, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { storage } from "@/lib/firebase";
import { ref, listAll, getDownloadURL, uploadBytes, deleteObject } from "firebase/storage";

interface DocItem {
    name: string;
    fullPath: string;
    url: string;
    size?: string; // listing doesn't give size easily without getMetadata, skipping for speed
}

export function DocumentsSection() {
    const [documents, setDocuments] = useState<DocItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const DOCUMENTS_PATH = 'project_docs/';

    const fetchDocuments = async () => {
        try {
            const listRef = ref(storage, DOCUMENTS_PATH);
            const res = await listAll(listRef);

            const docsWithUrls = await Promise.all(
                res.items.map(async (itemRef) => {
                    const url = await getDownloadURL(itemRef);
                    return {
                        name: itemRef.name,
                        fullPath: itemRef.fullPath,
                        url
                    };
                })
            );
            setDocuments(docsWithUrls);
        } catch (error) {
            console.error("Error fetching documents:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const fileRef = ref(storage, `${DOCUMENTS_PATH}${file.name}`);

            setUploading(true);
            try {
                await uploadBytes(fileRef, file);
                await fetchDocuments();
                // Reset input
                if (fileInputRef.current) fileInputRef.current.value = '';
            } catch (error) {
                console.error("Upload failed", error);
                alert("Upload failed");
            } finally {
                setUploading(false);
            }
        }
    };

    const handleDownload = (url: string) => {
        window.open(url, '_blank');
    };

    const handleDelete = async (fullPath: string) => {
        if (!confirm('Are you sure you want to delete this file?')) return;
        try {
            const deleteRef = ref(storage, fullPath);
            await deleteObject(deleteRef);
            await fetchDocuments();
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-iqm-primary" />
                Project Resources
            </h3>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />

            <div className="flex gap-3 mb-6">
                <button
                    onClick={handleUploadClick}
                    disabled={uploading}
                    className="flex-1 bg-iqm-primary text-white py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-medium hover:bg-iqm-sidebar transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-70"
                >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? 'Uploading...' : 'Upload File'}
                </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto min-h-[150px]">
                {loading ? (
                    <div className="flex justify-center items-center h-full text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                ) : documents.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm mt-10">No documents yet.</p>
                ) : (
                    documents.map((doc) => (
                        <div key={doc.name} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all group duration-200">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 min-w-[2.5rem] bg-gray-50 text-gray-500 rounded-lg flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-100">
                                    <FileText className="w-5 h-5 group-hover:text-iqm-primary transition-colors" />
                                </div>
                                <div className="truncate">
                                    <p className="text-sm font-semibold text-gray-800 group-hover:text-iqm-primary transition-colors truncate">{doc.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>Document</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDownload(doc.url)}
                                    title="Download"
                                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-white hover:shadow-sm rounded-lg transition-all active:scale-90 border border-transparent hover:border-gray-100"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(doc.fullPath)}
                                    title="Delete"
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white hover:shadow-sm rounded-lg transition-all active:scale-90 border border-transparent hover:border-gray-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
