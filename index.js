const pg = require('pg')
const express = require('express')
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_notes_employees_db')
const app = express()

app.use(express.json());
app.use(require('morgan')('dev'));

app.get('/api/employees', async (req, res, next) => {
  try {
    const SQL = `
      SELECT * from employees ORDER BY created_at DESC;
    `
    const response = await client.query(SQL)
    res.send(response.rows)
  } catch (ex) {
    next(ex)
  }
})

app.get('/api/departments', async (req, res, next) => {
  try {
    const SQL = `
        SELECT * from departments ;
      `
    const response = await client.query(SQL)
    res.send(response.rows)
  } catch (ex) {
    next(ex)
  }
})

app.delete('/api/employees/:id', async (req, res, next) => {
  try {
    const SQL = `DELETE FROM employees
        WHERE id=$1`
    const result = await client.query(SQL, [req.params.id])
    res.sendStatus(204)

  } catch (error) {
    next(error)
  }
})

  app.put('/api/employees/:id', async (req, res, next) => {
    try {
      const SQL = `
        UPDATE employees
        SET txt=$1, ranking=$2, category_id=$3, updated_at= now()
        WHERE id=$4 RETURNING *
      `
      console.log(req.body)
      const response = await client.query(SQL, [
        req.body.txt,
        req.body.ranking,
        req.body.category_id,
        req.params.id
      ])
      res.send(response.rows[0])
    } catch (ex) {
      next(ex)
    }
  })

  async function init() {
    await client.connect()
    let SQL = `
    DROP TABLE IF EXISTS employees;
    DROP TABLE IF EXISTS departments;
    CREATE TABLE departments(
    id SERIAL PRIMARY KEY,
    name VARCHAR(25) NOT NULL);
    
    CREATE TABLE employees(
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    ranking INTEGER DEFAULT 3 NOT NULL,
    name VARCHAR(25) NOT NULL,
    department_id INTEGER REFERENCES departments(id) NOT NULL);
    
    INSERT INTO departments(name) VALUES('Pack');
    INSERT INTO departments(name) VALUES('Pick');
    INSERT INTO departments(name) VALUES('Ship Dock');
    INSERT INTO employees (name,department_id) VALUES('Ahmed',(SELECT id FROM departments WHERE name= 'Pack'));
    INSERT INTO employees (name,department_id) VALUES ('Yasin',(SELECT id FROM departments WHERE name= 'Pack'));
    INSERT INTO employees (name,department_id) VALUES ('Mak',(SELECT id FROM departments WHERE name= 'Pick'));
    INSERT INTO employees (name,department_id) VALUES ('Tom',(SELECT id FROM departments WHERE name= 'Pack'));
    INSERT INTO employees (name,department_id) VALUES ('Khled',(SELECT id FROM departments WHERE name= 'Pack'));
    INSERT INTO employees (name,department_id) VALUES ('Joy',(SELECT id FROM departments WHERE name= 'Pack'));
    INSERT INTO employees (name,department_id) VALUES ('Noor',(SELECT id FROM departments WHERE name= 'Ship Dock'));
    INSERT INTO employees (name,department_id) VALUES ('Mohammed',(SELECT id FROM departments WHERE name= 'Pack'));
    INSERT INTO employees (name,department_id) VALUES ('Zein',(SELECT id FROM departments WHERE name= 'Pack'));
    INSERT INTO employees (name,department_id) VALUES ('Billy',(SELECT id FROM departments WHERE name= 'Pack'));


    `;

    await client.query(SQL)
    console.log('data seeded')
    const port = process.env.PORT || 3000
    app.listen(port, () => console.log(`listening on port ${port}`))
  }



  // init function invocation

  init()
