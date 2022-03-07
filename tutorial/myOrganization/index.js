// Person and Project are Document
// Task and Job are Objects
//

const project = 'Project01';
const task = 'Task01';

const job01 = 'Job01';
const job02 = 'Job02';

WOQL.and(
// id for all the Entity Document or Object
  WOQL.idgen('doc:Project', [project], 'v:Project'),
  WOQL.idgen('doc:Task', [project, task], 'v:Task'),
  WOQL.idgen('doc:Job', [project, task, job01], 'v:Job01'),
  WOQL.idgen('doc:Job', [project, task, job02], 'v:Job02'),
  WOQL.idgen('doc:Person', ['John', 'Smith'], 'v:Person001'),
  WOQL.idgen('doc:Person', ['Tom', 'Baker'], 'v:Person002'),

  // create 2 Document type Person
  WOQL.add_triple('v:Person001', 'type', 'scm:Person')
    .add_triple('v:Person001', 'scm:surname', 'Smith')
    .add_triple('v:Person001', 'scm:p_name', 'John')

    .add_triple('v:Person002', 'type', 'scm:Person')
    .add_triple('v:Person002', 'scm:surname', 'Baker')
    .add_triple('v:Person002', 'scm:p_name', 'Tom')

  // create 2 Object type Job and link with Person
    .add_triple('v:Job01', 'type', 'scm:Job')
    .add_triple('v:Job01', 'scm:assigned', 'v:Person001')
    .add_triple('v:Job01', 'scm:title', 'User login/Sign up')
    .add_triple('v:Job01', 'scm:summary', 'Create/testing .......')

    .add_triple('v:Job02', 'type', 'scm:Job')
    .add_triple('v:Job02', 'scm:assigned', 'v:Person002')
    .add_triple('v:Job02', 'scm:title', 'CRUD Functionality....')
    .add_triple('v:Job02', 'scm:summary', 'Create/testing .......')

  // Create an Object type Task and linked with Job
    .add_triple('v:Task', 'type', 'scm:Task')
    .add_triple('v:Task', 'scm:title', 'Document Application')
    .add_triple('v:Task', 'scm:summary', 'Create an application that .......')
    .add_triple('v:Task', 'scm:task_job', 'v:Job01')
    .add_triple('v:Task', 'scm:task_job', 'v:Job02')

  // Create 1 Document type Project and link with task
    .add_triple('v:Project', 'type', 'scm:Project')
    .add_triple('v:Project', 'scm:project_task', 'v:Task'),
);

// in TerminusDB everything in insert as triple

// triple("subject","predicate","object")
// this is a query that get back only "Object type"
// I get back all the task and all the job related at the task
WOQL.and(
  WOQL.triple('v:Task', 'type', 'scm:Task'),
  WOQL.triple('v:Task', 'task_job', 'v:job'),
);
// with a name of a specific task "doc:Task_Project_002_Task_002" you can get back all the job related
WOQL.and(
  WOQL.triple('doc:Task_Project_002_Task_002', 'type', 'scm:Task'),
  WOQL.triple('doc:Task_Project_002_Task_002', 'task_job', 'v:job'),
);
// doc:Task_Project_002_Task_002
