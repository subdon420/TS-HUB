import React, { useState } from 'react';
import { Layers, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !key) {
      addToast('Project Name and Key are required', 'error');
      return;
    }

    setLoading(true);
    try {
      const created = await api.createProject({
        name,
        key: key.toUpperCase().trim(),
        description,
        repositoryUrl,
      });

      addToast(`Project [${created.key}] created successfully!`, 'success');
      if (onProjectCreated) onProjectCreated(created);
      onClose();
    } catch (err) {
      addToast(err.message || 'Failed to create project', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🚀 Create New Project Hub" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
            Project Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!key) {
                const words = e.target.value.split(/\s+/).filter(Boolean);
                const suggested = words.map(w => w[0]).join('').substring(0, 4).toUpperCase();
                setKey(suggested);
              }
            }}
            placeholder="e.g. NextGen Microservices"
            className="w-full glass-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono uppercase text-cyan-400 mb-1">
              Project Key (Prefix) *
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              placeholder="e.g. NGM"
              className="w-full glass-input font-mono font-bold uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
              Git Repository URL
            </label>
            <input
              type="text"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full glass-input text-xs font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Scope of testing, release milestones, architecture notes..."
            className="w-full glass-input text-xs"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
          >
            {loading ? 'Creating...' : 'Initialize Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

