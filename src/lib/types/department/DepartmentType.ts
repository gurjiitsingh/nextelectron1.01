export type DepartmentType = {
  id: string;

  name: string;
  code: string;

  type: 'PRODUCTION' | 'SERVICE';

  description?: string;

  managerId?: string;     // reference ID
  managerName?: string;   // snapshot for fast UI

  isActive: boolean;
  createdAt: number;

  // employee count
  employeeCount?: number;

  // future
  costCenterCode?: string;
};