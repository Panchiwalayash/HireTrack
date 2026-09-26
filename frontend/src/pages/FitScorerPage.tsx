import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { CompanyFitView } from '../components/optimizer/CompanyFitView';

export const FitScorerPage: React.FC = () => {
  const { jobs, handleImportOptimizedJobs } = useData();
  const navigate = useNavigate();

  return (
    <CompanyFitView
      jobs={jobs}
      onImportJobs={handleImportOptimizedJobs}
      onNavigateToJobs={() => navigate('/jobs')}
    />
  );
};
