import React from 'react';

function ApplicationCard({ application, statusSteps, getStatusIndex }) {
  return (
    <div className="application-card">
      <p><strong>Name:</strong> {application.name}</p>
      <p><strong>Location:</strong> {application.location}</p>
      <p><strong>Budget:</strong> ${application.budget}</p>
      <p>
        <strong>Status:</strong>{' '}
        <span className="status-badge">
          {application.status || 'Pending Review'}
        </span>
      </p>
      <div className="progress-bar">
        {statusSteps.map((step, index) => (
          <div
            key={index}
            className={`progress-step ${
              index <= getStatusIndex(application.status) ? 'active' : ''
            }`}
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ApplicationCard;
