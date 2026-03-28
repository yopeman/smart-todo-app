import { gql } from '@apollo/client';

export const GET_ME = gql`
  query Me {
    me {
      id
      email
      name
      avatar
    }
  }
`;

export const PROJECT_FIELDS = gql`
  fragment ProjectFields on Project {
    id
    title
    description
    priority
    urgent_important_matrix
    status
    updated_at
    tasks {
      id
      title
      description
      status
      order_weight
      subtasks {
        id
        title
        status
        order_weight
      }
    }
  }
`;

export const GET_PROJECTS = gql`
  query GetProjects {
    my_projects {
      ...ProjectFields
    }
    shared_projects {
      ...ProjectFields
    }
    public_projects {
      ...ProjectFields
    }
  }
  ${PROJECT_FIELDS}
`;

export const GET_PROJECT_DETAILS = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
      ...ProjectFields
    }
  }
  ${PROJECT_FIELDS}
`;
