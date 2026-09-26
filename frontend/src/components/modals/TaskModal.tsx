import React, { useState, useEffect } from 'react';
import type { Job, Task, TaskType, TaskStatus } from '../../models';
import { X } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  jobId: string | null;
  jobs: Job[];
  taskToEdit: Task | null;
  initialType?: TaskType;
  onClose: () => void;
  onSave: (taskData: { job_id: string; type: TaskType; status: TaskStatus; notes?: string }) => Promise<void>;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  jobId,
  jobs,
  taskToEdit,
  initialType,
  onClose,
  onSave,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [type, setType] = useState<TaskType>('Resume');
  const [status, setStatus] = useState<TaskStatus>('not_started');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setSelectedJobId(taskToEdit.job_id);
      setType(taskToEdit.type);
      setStatus(taskToEdit.status);
      setNotes(taskToEdit.notes || '');
    } else {
      setSelectedJobId(jobId || (jobs[0]?.id ?? ''));
      setType(initialType || 'Resume');
      setStatus('not_started');
      setNotes('');
    }
  }, [isOpen, taskToEdit, jobId, initialType, jobs]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) return;

    try {
      setIsSubmitting(true);
      await onSave({
        job_id: selectedJobId,
        type,
        status,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-dialog__header">
          <h3>{taskToEdit ? 'Edit Pipeline Task' : 'Add Pipeline Task'}</h3>
          <button className="btn btn--ghost btn--sm" onClick={onClose} style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-dialog__body">
            <div className="form-group">
              <label htmlFor="task-job">Target Company & Role *</label>
              <select
                id="task-job"
                className="select"
                value={selectedJobId}
                disabled={Boolean(taskToEdit || jobId)}
                onChange={(e) => setSelectedJobId(e.target.value)}
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.company} — {j.role}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label htmlFor="task-type">Task Category *</label>
                <select
                  id="task-type"
                  className="select"
                  value={type}
                  onChange={(e) => setType(e.target.value as TaskType)}
                >
                  <option value="Resume">Resume Tailoring</option>
                  <option value="Cover_Letter">Cover Letter</option>
                  <option value="Coding_Challenge">Coding Challenge / OA</option>
                  <option value="System_Design">System Design Round</option>
                  <option value="Behavioral">Behavioral / Leadership</option>
                  <option value="Take_Home">Take-Home Assignment</option>
                  <option value="Negotiation">Offer Negotiation</option>
                  <option value="Background_Check">Background Check</option>
                  <option value="Other">Other Custom Step</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="task-status">Status</label>
                <select
                  id="task-status"
                  className="select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done / Completed</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="task-notes">Notes & Key Details</label>
              <textarea
                id="task-notes"
                className="textarea"
                placeholder="Specific topics to prepare, interviewer questions, project links..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-dialog__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : taskToEdit ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
