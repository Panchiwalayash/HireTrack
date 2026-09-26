import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { RequirementsMatrix } from '../components/matrix/RequirementsMatrix';
import { TaskModal } from '../components/modals/TaskModal';
import { useNavigate } from 'react-router-dom';
import type { TaskType } from '../models';

export const MatrixPage: React.FC = () => {
  const { jobs, tasks, handleUpdateTaskStatus, handleSaveTask } = useData();
  const navigate = useNavigate();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [targetJobId, setTargetJobId] = useState<string | null>(null);
  const [initialTaskType, setInitialTaskType] = useState<TaskType | undefined>();

  const handleOpenAddTask = (jobId: string, type?: TaskType) => {
    setTargetJobId(jobId);
    setInitialTaskType(type);
    setIsTaskModalOpen(true);
  };

  return (
    <>
      <RequirementsMatrix
        jobs={jobs}
        tasks={tasks}
        onUpdateTaskStatus={handleUpdateTaskStatus}
        onAddTask={(jobId: string, type: TaskType) => handleOpenAddTask(jobId, type)}
        onSelectJob={() => navigate('/jobs')}
      />
      <TaskModal
        isOpen={isTaskModalOpen}
        jobId={targetJobId}
        jobs={jobs}
        taskToEdit={null}
        initialType={initialTaskType}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTargetJobId(null);
          setInitialTaskType(undefined);
        }}
        onSave={handleSaveTask}
      />
    </>
  );
};
