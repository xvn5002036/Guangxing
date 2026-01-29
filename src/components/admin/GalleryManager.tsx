import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { supabase } from '../../services/supabase';
import { Trash2, Edit, Plus, Image as ImageIcon, FolderInput, Eye, LogOut, Github, Loader2 } from 'lucide-react';
import { GalleryItem } from '../../types';

export const GalleryManager: React.FC = () => {
    const {
        gallery, galleryAlbums,
        addGalleryItem, addGalleryItems, updateGalleryItem, deleteGalleryItem,
        addGalleryAlbum, updateGalleryAlbum, deleteGalleryAlbum
    } = useData();

    // Local States
    const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    // UI States
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    // GitHub Config State
    const [showGithubImport, setShowGithubImport] = useState(false);
    const [githubConfig, setGithubConfig] = useState(() => {
        const saved = localStorage.getItem('githubConfig');
        return saved ? JSON.parse(saved) : {
            owner: 'xvn5002036',
            repo: 'gallery',
            path: 'gallery',
            token: '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'
        };
    });

    // Persist GitHub config
    useEffect(() => {
        localStorage.setItem('githubConfig', JSON.stringify(githubConfig));
    }, [githubConfig]);

    // File Upload States
    const [isUploadingToGithub, setIsUploadingToGithub] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isSyncingGithub, setIsSyncingGithub] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [showBatchUrlImport, setShowBatchUrlImport] = useState(false);
    const [batchUrls, setBatchUrls] = useState('');
    const [isImportingUrls, setIsImportingUrls] = useState(false);

    // Helpers
    const deleteGithubFile = async (imageUrl: string) => {
        if (!imageUrl || !imageUrl.includes('raw.githubusercontent.com') || !githubConfig.token) return;

        try {
            const urlParts = imageUrl.split('/');
            if (urlParts.length >= 7) {
                const owner = urlParts[3];
                const repo = urlParts[4];
                const branch = urlParts[5];
                const pathParts = urlParts.slice(6).map(p => decodeURIComponent(p));
                const path = pathParts.join('/');
                const encodedPath = pathParts.map(p => encodeURIComponent(p)).join('/');

                const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`;
                const getResponse = await fetch(apiUrl, {
                    headers: {
                        'Authorization': `Bearer ${githubConfig.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });

                if (getResponse.ok) {
                    const fileData = await getResponse.json();
                    const deleteResponse = await fetch(apiUrl, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${githubConfig.token}`,
                            'Accept': 'application/vnd.github.v3+json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            message: `Delete ${path} via CMS`,
                            sha: fileData.sha,
                            branch: branch
                        })
                    });

                    if (deleteResponse.ok) {
                        console.log("Successfully deleted from GitHub:", path);
                    } else {
                        console.error("Failed to delete from GitHub:", await deleteResponse.text());
                        alert("注意：無法從 GitHub 刪除檔案，請檢查 Token 權限或手動刪除。");
                    }
                }
            }
        } catch (ghError) {
            console.error("GitHub Sync Delete Error:", ghError);
        }
    };

    const handleBatchUrlImport = async () => {
        const rawUrls = batchUrls.split('\n').map(u => u.trim()).filter(u => u.startsWith('http'));
        if (rawUrls.length === 0) {
            alert('請輸入有效的網址 (每行一個)');
            return;
        }

        setIsImportingUrls(true);
        try {
            const finalItems: any[] = []; // Type any to avoid partial match issues

            for (const url of rawUrls) {
                // Check if it's a Google Photos URL
                if (url.includes('photos.app.goo.gl') || (url.includes('photos.google.com/share') && !url.includes('?key=')) || url.includes('photos.google.com/album/')) {

                    // Specific Warning for private album URLs
                    if (url.includes('/album/') && !url.includes('/share')) {
                        alert(`偵測到私人相簿網址：\n${url}\n\n請使用 Google 相簿中的「分享」功能產生的連結 (例如 photos.app.goo.gl/...)，私人網址無法直接匯入。`);
                        continue;
                    }

                    try {
                        console.log("Fetching Google Photos via proxy:", url);
                        // Use CORS proxy to fetch Google Photos page
                        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
                        const response = await fetch(proxyUrl);
                        if (!response.ok) throw new Error("代理伺服器回傳錯誤");

                        const html = await response.text();

                        if (!html || html.length < 100) throw new Error("取得的網頁內容不完整或為空");

                        // Regex to find high-res image URLs in the page content
                        const imgRegex = /https:\/\/lh[3-6]\.googleusercontent\.com\/[a-zA-Z0-9\/_\-]{50,}/g;
                        const matches = html.match(imgRegex);

                        if (matches && matches.length > 0) {
                            const filteredMatches = matches.filter((u: string) => u.includes('/pw/') || u.includes('/lr/'));

                            const uniqueUrls = Array.from(new Set(filteredMatches)).map((u: any) => {
                                let baseUrl = u.split('=')[0];
                                return `${baseUrl}=w2400`;
                            });

                            const validUrls = uniqueUrls.filter((u: string) => u.length > 80);

                            console.log(`Found ${validUrls.length} valid images in album.`);

                            validUrls.forEach((imgUrl, index) => {
                                finalItems.push({
                                    title: `從相簿匯入-${index + 1}`,
                                    type: 'IMAGE',
                                    url: imgUrl,
                                    albumId: selectedAlbumId
                                });
                            });
                        } else {
                            console.warn("No images found in Google Photos link:", url);
                            alert(`在該連結中找不到可匯入的圖片，請確認這是一個公開分享的相簿網址。`);
                        }
                    } catch (err: any) {
                        console.error("Error fetching Google Photos album:", err);
                        alert(`讀取 Google 相簿失敗：可能是代理伺服器暫時不穩定或網址解析有誤。\n錯誤資訊：${err.message}`);
                    }
                } else {
                    // Regular direct link
                    finalItems.push({
                        title: '快照匯入',
                        type: 'IMAGE',
                        url,
                        albumId: selectedAlbumId
                    });
                }
            }

            if (finalItems.length > 0) {
                await addGalleryItems(finalItems);
                setBatchUrls('');
                setShowBatchUrlImport(false);
                alert(`成功匯入 ${finalItems.length} 個項目！`);
            } else {
                alert('未找到可匯入的項目，請檢查連結是否正確。');
            }
        } catch (error: any) {
            alert(`匯入失敗：${error.message}`);
        } finally {
            setIsImportingUrls(false);
        }
    };

    const handleFileUploadToGithub = async (file: File, customPath?: string) => {
        if (!githubConfig.owner || !githubConfig.repo || !githubConfig.token) {
            throw new Error('請在 GitHub 匯入設定中填寫完整的 Owner, Repo 與 Token');
        }

        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1];
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        const base64Content = await base64Promise;
        const rawPath = customPath || `${githubConfig.path}/${Date.now()}_${file.name}`;

        // Encode each segment of the path individually to handle Chinese characters correctly
        const encodedPath = rawPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
        const apiUrl = `https://api.github.com/repos/${githubConfig.owner}/${githubConfig.repo}/contents/${encodedPath}`;

        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${githubConfig.token}`, // Fixed: changed 'token' to 'Bearer' for consistency
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Upload ${file.name} via CMS`,
                content: base64Content,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`GitHub Upload Error: ${error.message}`);
        }

        const data = await response.json();
        return data.content.download_url;
    };

    const handleBatchUpload = async () => {
        if (selectedFiles.length === 0) return;
        setIsSyncingGithub(true);

        try {
            let successCount = 0;
            const finalItems: any[] = [];

            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                try {
                    const downloadUrl = await handleFileUploadToGithub(file);
                    finalItems.push({
                        title: file.name.split('.')[0],
                        url: downloadUrl,
                        type: 'IMAGE',
                        albumId: selectedAlbumId
                    });
                    successCount++;
                } catch (error) {
                    console.error(`Upload failed for ${file.name}:`, error);
                }
            }

            // Replace temp items with real ones in DB (and update local state via context)
            if (successCount > 0 && selectedAlbumId) {
                // Remove temp items first (handled by context sync technically, but good to clean up if needed)
                // Actually addGalleryItems in context usually just adds to state. 
                // We should proceed to add real items to DB.
                // The context sync might handle the "real" add.
                // Since `addGalleryItems` (plural) was added to context in previous turns, we use it.
                await addGalleryItems(finalItems);

                // Cleanup temp items from local view if they aren't automatically replaced
                // (Depends on context implementation, but usually fetching from DB refreshes it)
            }

            alert(`成功上傳 ${successCount} / ${selectedFiles.length} 張照片`);
            setSelectedFiles([]);
            setShowGithubImport(false);
        } catch (error: any) {
            console.error("Batch upload error:", error);
            alert(`批次上傳失敗: ${error.message}`);
        } finally {
            setIsSyncingGithub(false);
            // In a real app we would clear temp items here if failure
        }
    };

    // Delete Handlers
    const handleDelete = async (id: string, isAlbum: boolean) => {
        if (isAlbum) {
            // Album Deletion Logic (Safe Check)
            console.log(`[Delete Album] Checking content for Album ID: ${id}`);

            const { data: dbItems, error: fetchError } = await supabase
                .from('gallery')
                .select('id')
                .eq('album_id', id);

            if (fetchError) {
                console.error("[Delete Album] Failed to check items:", fetchError);
                alert("警告：無法檢查相簿內容，請稍後再試。");
                return;
            }

            if (dbItems && dbItems.length > 0) {
                alert(`無法刪除：資料夾內尚有 ${dbItems.length} 張照片。\n\n請先進入資料夾，刪除所有照片後，才能刪除此資料夾。`);
                return;
            }

            if (confirm('確定要刪除此相簿嗎？')) {
                await deleteGalleryAlbum(id);
            }
        } else {
            // Photo Deletion Logic
            if (confirm('確定要刪除此照片嗎？')) {
                const item = gallery.find(g => g.id === id);
                if (item?.url) {
                    await deleteGithubFile(item.url);
                }
                await deleteGalleryItem(id);
            }
        }
    };

    const handleBatchDelete = async () => {
        if (selectedItems.size === 0) return;

        if (window.confirm(`確定要刪除選取的 ${selectedItems.size} 筆資料嗎？此動作無法復原。`)) {
            let successCount = 0;
            let failCount = 0;

            for (const id of Array.from(selectedItems)) {
                try {
                    if (selectedAlbumId) {
                        const itemToDelete = gallery.find(g => g.id === id);
                        if (itemToDelete?.url) {
                            await deleteGithubFile(itemToDelete.url);
                        }
                        await deleteGalleryItem(id);
                    } else {
                        // Album batch delete (optional, usually safer to do one by one)
                        await deleteGalleryAlbum(id);
                    }
                    successCount++;
                } catch (error) {
                    console.error(`Failed to delete item ${id}:`, error);
                    failCount++;
                }
            }
            setSelectedItems(new Set());
            alert('已完成批次刪除');
        }
    };

    // Filter Data
    const filteredData = (selectedAlbumId
        ? gallery.filter(g => g.albumId === selectedAlbumId)
        : galleryAlbums
    ).filter(item => {
        if (!searchTerm) return true;
        const lower = searchTerm.toLowerCase();
        return item.title.toLowerCase().includes(lower) ||
            (item.description && item.description.toLowerCase().includes(lower));
    });

    // Pagination
    const paginatedItems = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Selection Handlers
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedItems(new Set(filteredData.map(item => item.id!)));
        } else {
            setSelectedItems(new Set());
        }
    };

    const handleSelectOne = (id: string) => {
        const newSet = new Set(selectedItems);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedItems(newSet);
    };

    // Save Handlers
    const handleSave = async () => {
        if (!editForm.title) {
            alert('標題為必填');
            return;
        }
        setIsSaving(true);
        try {
            if (editingId) {
                if (selectedAlbumId) await updateGalleryItem(editingId, editForm);
                else await updateGalleryAlbum(editingId, editForm);
            } else {
                if (selectedAlbumId) {
                    await addGalleryItem({ ...editForm, albumId: selectedAlbumId, type: 'IMAGE' });
                } else {
                    await addGalleryAlbum(editForm);
                }
            }
            setIsAdding(false);
            setEditingId(null);
            setEditForm({});
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    {selectedAlbumId ? (
                        <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedAlbumId(null)} className="text-gray-400 hover:text-white">
                                相簿列表
                            </button>
                            <span className="text-gray-600">/</span>
                            <h2 className="text-2xl font-bold text-white">
                                {galleryAlbums.find(a => a.id === selectedAlbumId)?.title || '相簿內容'}
                            </h2>
                        </div>
                    ) : (
                        <h2 className="text-2xl font-bold text-white">活動花絮 (相簿管理)</h2>
                    )}
                </div>

                <div className="flex gap-2">
                    <button onClick={() => setShowGithubImport(!showGithubImport)} className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center gap-2">
                        <Github size={16} /> GitHub 設定
                    </button>
                    {selectedAlbumId && (
                        <button onClick={() => setIsAdding(true)} className="bg-mystic-gold text-black px-4 py-2 rounded font-bold hover:bg-yellow-500 flex items-center gap-2">
                            <Plus size={16} /> 上傳照片
                        </button>
                    )}
                    {!selectedAlbumId && (
                        <button onClick={() => { setIsAdding(true); setEditForm({}); }} className="bg-mystic-gold text-black px-4 py-2 rounded font-bold hover:bg-yellow-500 flex items-center gap-2">
                            <Plus size={16} /> 建立相簿
                        </button>
                    )}
                    {selectedItems.size > 0 && (
                        <button onClick={handleBatchDelete} className="bg-red-900/80 text-white px-4 py-2 rounded hover:bg-red-800 flex items-center gap-2">
                            <Trash2 size={16} /> 刪除選取 ({selectedItems.size})
                        </button>
                    )}
                </div>
            </div>

            {/* GitHub Config Panel */}
            {showGithubImport && (
                <div className="bg-gray-900 border border-gray-700 p-4 rounded mb-4">
                    <h3 className="text-white font-bold mb-2">GitHub API 設定</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input placeholder="Personal Access Token" type="password" value={githubConfig.token} onChange={e => setGithubConfig({ ...githubConfig, token: e.target.value })} className="bg-black text-white p-2 border border-gray-700 rounded" />
                        <input placeholder="Owner (e.g. xvn5002036)" value={githubConfig.owner} onChange={e => setGithubConfig({ ...githubConfig, owner: e.target.value })} className="bg-black text-white p-2 border border-gray-700 rounded" />
                        <input placeholder="Repo (e.g. gallery)" value={githubConfig.repo} onChange={e => setGithubConfig({ ...githubConfig, repo: e.target.value })} className="bg-black text-white p-2 border border-gray-700 rounded" />
                        <input placeholder="Path (e.g. gallery)" value={githubConfig.path} onChange={e => setGithubConfig({ ...githubConfig, path: e.target.value })} className="bg-black text-white p-2 border border-gray-700 rounded" />
                    </div>
                </div>
            )}

            {/* Editor Form */}
            {(isAdding || editingId) && (
                <div className="bg-mystic-charcoal p-6 border border-white/10 rounded mb-6">
                    <h3 className="text-white font-bold mb-4">{editingId ? '編輯' : '新增'}</h3>
                    <div className="space-y-4">
                        {!selectedAlbumId && (
                            <>
                                <input placeholder="相簿標題" value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="w-full bg-black text-white p-2 border border-white/20 rounded" />
                                <textarea placeholder="描述" value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="w-full bg-black text-white p-2 border border-white/20 rounded" />
                                <input placeholder="封面圖片 URL" value={editForm.coverImageUrl || ''} onChange={e => setEditForm({ ...editForm, coverImageUrl: e.target.value })} className="w-full bg-black text-white p-2 border border-white/20 rounded" />
                            </>
                        )}
                        {selectedAlbumId && (
                            <div className="border-2 border-dashed border-gray-600 rounded p-8 text-center"
                                onDragOver={e => e.preventDefault()}
                                onDrop={e => {
                                    e.preventDefault();
                                    if (e.dataTransfer.files) setSelectedFiles(Array.from(e.dataTransfer.files));
                                }}
                            >
                                <input type="file" multiple ref={fileInputRef} className="hidden" onChange={e => e.target.files && setSelectedFiles(Array.from(e.target.files))} />
                                <ImageIcon className="mx-auto text-gray-500 mb-2" size={48} />
                                <p className="text-gray-400 mb-4">拖拉照片至此，或點擊選擇檔案</p>
                                <button onClick={() => fileInputRef.current?.click()} className="bg-gray-700 text-white px-4 py-2 rounded">選擇檔案</button>

                                {selectedFiles.length > 0 && (
                                    <div className="mt-4 text-left">
                                        <h4 className="text-white font-bold px-2">已選擇 {selectedFiles.length} 個檔案:</h4>
                                        <ul className="text-gray-400 text-sm list-disc pl-6 max-h-32 overflow-y-auto">
                                            {selectedFiles.map((f, i) => <li key={i}>{f.name}</li>)}
                                        </ul>
                                        <button onClick={handleBatchUpload} disabled={isSyncingGithub} className="mt-4 w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-500 disabled:opacity-50">
                                            {isSyncingGithub ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={16} /> 上傳中...</span> : '開始上傳'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => { setIsAdding(false); setEditingId(null); setSelectedFiles([]); }} className="px-4 py-2 rounded text-gray-400 hover:text-white">取消</button>
                            {!selectedAlbumId && <button onClick={handleSave} className="bg-mystic-gold text-black px-4 py-2 rounded font-bold">儲存</button>}
                        </div>
                    </div>
                </div>
            )}

            {/* List Table */}
            <div className="bg-mystic-charcoal rounded overflow-hidden border border-white/5 shadow-2xl">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-gray-400 uppercase tracking-widest text-[10px]">
                        <tr>
                            <th className="p-4 w-10">
                                <input type="checkbox" checked={selectedItems.size === filteredData.length && filteredData.length > 0} onChange={handleSelectAll} />
                            </th>
                            <th className="p-4">{selectedAlbumId ? '相片預覽' : '相簿名稱'}</th>
                            <th className="p-4">{selectedAlbumId ? '標題' : '描述'}</th>
                            <th className="p-4 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {paginatedItems.map((item: any) => (
                            <tr key={item.id} className={`hover:bg-white/5 ${selectedItems.has(item.id) ? 'bg-white/5' : ''}`}>
                                <td className="p-4">
                                    <input type="checkbox" checked={selectedItems.has(item.id)} onChange={() => handleSelectOne(item.id)} />
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img src={selectedAlbumId ? item.url : (item.coverImageUrl || 'https://placehold.co/100x100?text=No+Cover')} className="w-12 h-12 object-cover rounded shadow" />
                                        {!selectedAlbumId && <span className="font-bold text-white max-w-[200px] truncate">{item.title}</span>}
                                    </div>
                                </td>
                                <td className="p-4 text-gray-400 max-w-xs truncate">
                                    {selectedAlbumId ? item.title : item.description}
                                </td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                    {selectedAlbumId ? (
                                        <>
                                            <button onClick={() => window.open(item.url, '_blank')} className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600" title="預覽"><Eye size={16} /></button>
                                            <button onClick={() => {
                                                if (confirm('設為封面?')) updateGalleryAlbum(selectedAlbumId, { coverImageUrl: item.url }).then(() => alert('已更新封面'));
                                            }} className="p-2 bg-green-900/20 text-green-400 rounded hover:bg-green-900/40" title="設為封面"><ImageIcon size={16} /></button>
                                            <button onClick={() => handleDelete(item.id, false)} className="p-2 bg-red-900/20 text-red-400 rounded"><Trash2 size={16} /></button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => setSelectedAlbumId(item.id)} className="p-2 bg-blue-900/20 text-blue-400 rounded flex items-center gap-1"><FolderInput size={16} /> 進入</button>
                                            <button onClick={() => { setEditingId(item.id); setEditForm({ ...item }); }} className="p-2 bg-gray-800 text-gray-400 rounded"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(item.id, true)} className="p-2 bg-red-900/20 text-red-400 rounded"><Trash2 size={16} /></button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls could go here */}
        </div>
    );
};
