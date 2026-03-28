import { gql } from '@apollo/client';

export const PROJECT_UPDATED_SUBSCRIPTION = gql`
  subscription ProjectUpdated($project_id: ID!) {
    projectUpdated(project_id: $project_id) {
      id
      title
      updated_at
      tasks { 
        id 
        title 
      }
    }
  }
`;
