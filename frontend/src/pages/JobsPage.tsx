import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { JobListView } from '../components/jobs/JobListView';
import { TaskModal } from '../components/modals/TaskModal';
import type { Job } from '../models';

export const JobsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    jobs,
    tasks,
    handleDeleteJob,
    handleUpdateJobStatus,
    handleUpdateTaskStatus,
    handleDeleteTask,
    handleSaveTask,
  } = useData();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedJobIdForTask, setSelectedJobIdForTask] = useState<string | null>(null);

  const handleOpenAddTask = (jobId: string) => {
    setSelectedJobIdForTask(jobId);
    setIsTaskModalOpen(true);
  };

  return (
    <>
      <JobListView
        jobs={jobs}
        tasks={tasks}
        onOpenNewJob={() => navigate('/jobs/new')}
        onEditJob={(job: Job) => navigate(`/jobs/${job.id}/edit`)}
        onDeleteJob={handleDeleteJob}
        onUpdateJobStatus={handleUpdateJobStatus}
        onAddTask={handleOpenAddTask}
        onUpdateTaskStatus={handleUpdateTaskStatus}
        onDeleteTask={handleDeleteTask}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        jobId={selectedJobIdForTask}
        jobs={jobs}
        taskToEdit={null}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedJobIdForTask(null);
        }}
        onSave={handleSaveTask}
      />
    </>
  );
};
