"use client";

import React, { useState } from "react";
import {
    Plus,
    Search,
    ClipboardList,
    ArrowLeft,
    User,
    Calendar,
    MoreVertical
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useERPData } from "@/hooks/useERPData";
import ERPFormModal from "@/components/ERPFormModal";
import { supabase } from "@/lib/supabase";

interface Task {
    id: string;
    organization_id: string;
    title: string;
    description: string;
    assigned_to: string | null;
    status: 'Todo' | 'In Progress' | 'Pending' | 'Done';
    due_date: string | null;
    created_at: string;
}

interface TaskComment {
    id: string;
    task_id: string;
    user_id: string;
    user_name: string;
    comment: string;
    created_at: string;
}

interface Employee {
    id: string;
    name: string;
    department: string;
}

export default function TasksBoardPage() {
    const { t } = useLanguage();
    const { data: tasks, loading, upsert, refresh } = useERPData<any>('tasks');
    const { data: staff } = useERPData<any>('staff');
    const { data: projects } = useERPData<any>('projects');
    const { session } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assigned_to: '',
        status: 'Todo',
        due_date: '',
        project_id: ''
    });

    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isPostingComment, setIsPostingComment] = useState(false);

    // Simulating the current logged-in user for commenting.
    // In a real app this comes from `useAuth` hook. 
    const currentUserId = "system-user-uuid";
    const currentUserName = "System Admin";

    const loadComments = async (taskId: string) => {
        const { data, error } = await supabase
            .from('task_comments')
            .select('*')
            .eq('task_id', taskId)
            .order('created_at', { ascending: true });

        if (!error && data) {
            setComments(data);
        }
    };

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsDetailModalOpen(true);
        loadComments(task.id);
    };

    const handlePostComment = async () => {
        if (!newComment.trim() || !selectedTask) return;
        setIsPostingComment(true);
        try {
            const { error } = await supabase.from('task_comments').insert({
                task_id: selectedTask.id,
                user_id: currentUserId,
                user_name: currentUserName,
                comment: newComment.trim()
            });
            if (error) throw error;
            setNewComment("");
            loadComments(selectedTask.id);
        } catch (error) {
            console.error("Failed to post comment", error);
        } finally {
            setIsPostingComment(false);
        }
    };

    const updateTaskStatus = async (status: string) => {
        if (!selectedTask) return;

        // Optimistic UI update
        setSelectedTask({ ...selectedTask, status: status as any });

        // DB update
        await supabase.from('tasks').update({ status }).eq('id', selectedTask.id);
        refresh();
    };

    const handleAddTask = async () => {
        try {
            setIsSubmitting(true);
            await upsert({
                title: formData.title,
                description: formData.description,
                assigned_to: formData.assigned_to || null,
                status: formData.status as any,
                due_date: formData.due_date || null,
                project_id: formData.project_id || null
            });
            setIsModalOpen(false);
            setFormData({
                title: '',
                description: '',
                assigned_to: '',
                status: 'Todo',
                due_date: '',
                project_id: ''
            });
        } catch (error) {
            console.error("Error adding task:", error);
            alert("Failed to add task. Check console for details.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = 'move';
        // Hide the ghost image slightly
        const target = e.target as HTMLElement;
        setTimeout(() => target.style.opacity = '0.5', 0);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggedTaskId(null);
        const target = e.target as HTMLElement;
        target.style.opacity = '1';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, status: 'Todo' | 'In Progress' | 'Pending' | 'Done') => {
        e.preventDefault();
        if (!draggedTaskId) return;

        // Optimistic update
        const updatedTasks = tasks.map(t =>
            t.id === draggedTaskId ? { ...t, status } : t
        );
        refresh();

        // Persist to DB
        const { error } = await supabase
            .from('tasks')
            .update({ status })
            .eq('id', draggedTaskId);

        if (error) {
            console.error('Failed to move task:', error);
            refresh(); // Revert
        }
    };

    const columns: Array<{ id: 'Todo' | 'In Progress' | 'Pending' | 'Done'; title: string; color: string }> = [
        { id: 'Todo', title: 'To Do', color: 'border-gray-500 text-gray-400' },
        { id: 'In Progress', title: 'In Progress', color: 'border-blue-500 text-blue-400' },
        { id: 'Pending', title: 'Pending', color: 'border-yellow-500 text-yellow-500' },
        { id: 'Done', title: 'Done', color: 'border-emerald-500 text-emerald-400' }
    ];

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <main className="flex-1 p-8 overflow-hidden flex flex-col h-screen">
                <header className="flex justify-between items-center mb-8 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-xl border border-border-custom hover:border-accent hover:text-accent transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">Task Board</h2>
                            <p className="text-gray-400 text-sm mt-1">Marketing sprint tracking and assignments</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="gradient-accent flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                    >
                        <Plus size={20} />
                        <span>Add Task</span>
                    </button>
                </header>

                {loading ? (
                    <div className="flex items-center justify-center flex-1">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                    </div>
                ) : (
                    <div className="flex gap-6 flex-1 overflow-x-auto pb-4 custom-scrollbar">
                        {columns.map(col => {
                            const columnTasks = tasks.filter(t => t.status === col.id);
                            return (
                                <div
                                    key={col.id}
                                    className="flex flex-col flex-shrink-0 w-80 bg-[#111111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl"
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, col.id)}
                                >
                                    {/* Column Header */}
                                    <div className={`p-4 border-b-2 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-between ${col.color}`}>
                                        <h3 className="font-bold text-sm tracking-widest uppercase">{col.title}</h3>
                                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                                            {columnTasks.length}
                                        </div>
                                    </div>

                                    {/* Task List */}
                                    <div className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
                                        {columnTasks.map(task => {
                                            const assignedStaff = staff?.find(s => s.id === task.assigned_to);
                                            return (
                                                <div
                                                    key={task.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                                    onDragEnd={handleDragEnd}
                                                    onClick={() => handleTaskClick(task)}
                                                    className="bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl cursor-grab active:cursor-grabbing transition-all hover:shadow-lg"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-sm text-gray-100">{task.title}</h4>
                                                        <button className="text-gray-500 hover:text-white transition-colors">
                                                            <MoreVertical size={14} />
                                                        </button>
                                                    </div>

                                                    {task.description && (
                                                        <p className="text-xs text-gray-400 mb-4 line-clamp-2">
                                                            {task.description}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                                                        {task.due_date ? (
                                                            <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded bg-white/5 ${new Date(task.due_date) < new Date() && task.status !== 'Done' ? 'text-red-400 border border-red-400/20' : 'text-gray-400'}`}>
                                                                <Calendar size={10} />
                                                                {new Date(task.due_date).toLocaleDateString()}
                                                            </div>
                                                        ) : <div />}

                                                        {assignedStaff ? (
                                                            <div className="flex justify-center items-center w-6 h-6 rounded-full bg-accent/20 text-accent text-[10px] font-bold border border-accent/30" title={assignedStaff.name}>
                                                                {assignedStaff.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-center items-center w-6 h-6 rounded-full bg-white/5 text-gray-500 text-[10px] font-bold border border-white/10 border-dashed" title="Unassigned">
                                                                <User size={10} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {columnTasks.length === 0 && (
                                            <div className="flex-1 flex items-center justify-center p-4">
                                                <span className="text-xs text-gray-600 font-bold uppercase tracking-widest border border-dashed border-white/5 px-4 py-8 rounded-xl block text-center w-full">Drop Tasks Here</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <ERPFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Create Marketing Task"
                    onSubmit={handleAddTask}
                    loading={isSubmitting}
                >
                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2 col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Task Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                                placeholder="e.g. Design new social media banners"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2 col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm h-20"
                                placeholder="Details and requirements..."
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="Todo">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Due Date</label>
                            <input
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm [color-scheme:dark]"
                            />
                        </div>
                        <div className="flex flex-col gap-2 col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Assign To (Staff)</label>
                            <select
                                value={formData.assigned_to}
                                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="">-- Unassigned --</option>
                                {staff?.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2 col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Link to Project (Optional)</label>
                            <select
                                value={formData.project_id}
                                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                className="glass bg-white/5 border-border-custom p-3 rounded-xl outline-none focus:border-accent transition-all text-sm"
                            >
                                <option value="">-- No Project --</option>
                                {projects?.map((p: any) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </ERPFormModal>

                {/* Task Detail & Comments Modal */}
                {isDetailModalOpen && selectedTask && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDetailModalOpen(false)}></div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative z-[101] shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/5 flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-xl font-bold text-white pr-8 leading-tight">{selectedTask.title}</h2>
                                    <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-500 hover:text-white absolute right-6 top-6 transition-colors">
                                        <Plus size={24} className="rotate-45" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 mt-2">
                                    <select
                                        value={selectedTask.status}
                                        onChange={(e) => updateTaskStatus(e.target.value)}
                                        className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md border outline-none cursor-pointer transition-all ${selectedTask.status === 'Todo' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                                            selectedTask.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                selectedTask.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            }`}
                                    >
                                        <option value="Todo" className="bg-[#111]">TODO</option>
                                        <option value="In Progress" className="bg-[#111]">IN PROGRESS</option>
                                        <option value="Pending" className="bg-[#111]">PENDING</option>
                                        <option value="Done" className="bg-[#111]">DONE</option>
                                    </select>

                                    {selectedTask.due_date && (
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Calendar size={14} /> {new Date(selectedTask.due_date).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                {/* Description section */}
                                {selectedTask.description && (
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                            <ClipboardList size={14} /> Description
                                        </h3>
                                        <div className="bg-white/5 p-4 rounded-xl text-sm text-gray-300 leading-relaxed whitespace-pre-wrap border border-white/5">
                                            {selectedTask.description}
                                        </div>
                                    </div>
                                )}

                                {/* Assignment Section */}
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <User size={14} /> Assigned To
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        {selectedTask.assigned_to ? (
                                            (() => {
                                                const s = staff?.find(s => s.id === selectedTask.assigned_to);
                                                if (!s) return <span className="text-sm text-gray-500">Unknown</span>;
                                                return (
                                                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl">
                                                        <div className="w-8 h-8 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center text-xs">
                                                            {s.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white">{s.name}</p>
                                                            <p className="text-xs text-gray-500">{s.department}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })()
                                        ) : (
                                            <span className="text-sm text-gray-500 italic bg-white/5 border border-white/5 px-4 py-2 rounded-xl block w-fit">Unassigned</span>
                                        )}
                                    </div>
                                </div>

                                {/* Comments Section */}
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Activity & Comments</h3>

                                    <div className="space-y-4">
                                        {comments.length === 0 ? (
                                            <p className="text-sm text-gray-600 italic">No comments yet. Be the first to start the discussion.</p>
                                        ) : (
                                            comments.map(c => (
                                                <div key={c.id} className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-300">
                                                        {c.user_name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 bg-white/5 rounded-xl rounded-tl-none p-3 border border-white/5">
                                                        <div className="flex justify-between items-baseline mb-1">
                                                            <span className="text-sm font-bold text-white">{c.user_name}</span>
                                                            <span className="text-[10px] text-gray-500">{new Date(c.created_at).toLocaleString()}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{c.comment}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                </div>
                            </div>

                            {/* Comment Input Box */}
                            <div className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment or update..."
                                    className="flex-1 bg-[#111] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-accent transition-all resize-none h-12 custom-scrollbar"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handlePostComment();
                                        }
                                    }}
                                />
                                <button
                                    onClick={handlePostComment}
                                    disabled={!newComment.trim() || isPostingComment}
                                    className="px-6 py-2 bg-accent text-black font-bold rounded-xl transition-all hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                >
                                    {isPostingComment ? '...' : 'Post'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </main>
        </div>
    );
}
