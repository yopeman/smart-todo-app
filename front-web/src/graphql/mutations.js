import { gql } from '@apollo/client';
import { PROJECT_FIELDS } from './queries';

export const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      ...ProjectFields
    }
  }
  ${PROJECT_FIELDS}
`;

export const UPDATE_TASK_STATUS = gql`
  mutation UpdateTaskStatus($id: ID!, $status: Status!) {
    updateTaskStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const REORDER_TASKS = gql`
  mutation ReorderTasks($task_order: [ID!]!) {
    reorderTasks(task_order: $task_order) {
      id
      order_weight
    }
  }
`;
