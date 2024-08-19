const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory database (replace with a real database in production)
let employees = [];

// Generate initial data
const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
const roles = ['Manager', 'Senior', 'Junior', 'Intern', 'Director', 'VP'];
const statuses = ['Active', 'On Leave', 'Terminated'];

for (let i = 0; i < 1000; i++) {
  employees.push({
    id: i + 1,
    name: `Employee ${i + 1}`,
    role: roles[Math.floor(Math.random() * roles.length)],
    department: departments[Math.floor(Math.random() * departments.length)],
    salary: Math.floor(Math.random() * 100000) + 30000,
    performance: Math.random(),
    tasks: Math.floor(Math.random() * 10) + 1,
    status: statuses[Math.floor(Math.random() * statuses.length)]
  });
}

// Routes

app.get('/',(req,res)=>{
  return res.send('hello world!!!!');
});

// Get all employees with pagination and filtering
app.get('/api/employees', (req, res) => {
  let result = [...employees];

  // Apply filters
  const { name, role, department, minSalary, maxSalary, minPerformance, maxPerformance } = req.query;

  if (name) {
    result = result.filter(emp => emp.name.toLowerCase().includes(name.toLowerCase()));
  }
  if (role) {
    result = result.filter(emp => emp.role === role);
  }
  if (department) {
    result = result.filter(emp => emp.department === department);
  }
  if (minSalary && maxSalary) {
    result = result.filter(emp => emp.salary >= Number(minSalary) && emp.salary <= Number(maxSalary));
  }
  if (minPerformance && maxPerformance) {
    result = result.filter(emp => emp.performance >= Number(minPerformance) && emp.performance <= Number(maxPerformance));
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedResult = result.slice(startIndex, endIndex);

  res.json({
    totalCount: result.length,
    page: page,
    limit: limit,
    employees: paginatedResult
  });
});

// Get a single employee
app.get('/api/employees/:id', (req, res) => {
  const employee = employees.find(emp => emp.id === parseInt(req.params.id));
  if (!employee) return res.status(404).send('Employee not found');
  res.json(employee);
});

// Create a new employee
app.post('/api/employees', (req, res) => {
  const newEmployee = {
    id: employees.length + 1,
    ...req.body
  };
  employees.push(newEmployee);
  res.status(201).json(newEmployee);
});

// Update an employee
app.put('/api/employees/:id', (req, res) => {
  const employeeIndex = employees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex === -1) return res.status(404).send('Employee not found');

  employees[employeeIndex] = { ...employees[employeeIndex], ...req.body };
  res.json(employees[employeeIndex]);
});

// Delete an employee
app.delete('/api/employees/:id', (req, res) => {
  const employeeIndex = employees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex === -1) return res.status(404).send('Employee not found');

  employees.splice(employeeIndex, 1);
  res.status(204).send();
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});