const express = require('express') // biblioteca de node para criar o servidor
const routes = express.Router() // para criar as rotas

// para encontrar a pasta views
const views = __dirname + '/views/'

const profile = {
  data: {
    name: 'Leonardo',
    avatar: 'https://github.com/leodiman182.png',
    'monthly-budget': 4000,
    'days-per-week': 5,
    'hours-per-day': 6,
    'vacations-per-year': 4,
    'value-hour': 75
  },
  controllers: {
    index(req, res) {
      return res.render(views + 'profile', { profile: profile.data })
    },
    update(req, res) {
      //req body para pegar os dados
      const data = req.body

      //definir quantas semanas há no ano - 52
      const weeksPerYear = 52

      //remover as semanas de férias do ano, para pegar quantas semanas tem em 1 mês
      const weeksPerMonth = (weeksPerYear - data['vacations-per-year']) / 12

      //quantas horas por semana estou trabalhando
      const weekTotalHours = data['hours-per-day'] * data['days-per-week']

      //total de horas trabalhadas no mês
      const monthlyTotalHours = weekTotalHours * weeksPerMonth

      //calcular o valor da hora
      const valueHour = data['monthly-budget'] / monthlyTotalHours

      profile.data = {
        ...profile.data,
        ...req.body,
        'value-hour': valueHour
      }

      return res.redirect('/profile')
    }
  }
}

const Job = {
  data: [
    {
      id: 1,
      name: 'Pizzaria Guloso',
      'daily-hours': 2,
      'total-hours': 60,
      created_at: Date.now()
    },
    {
      id: 2,
      name: 'OneTwo Project',
      'daily-hours': 3,
      'total-hours': 47,
      created_at: Date.now()
    }
  ],
  controllers: {
    index(req, res) {
      const updatedJobs = Job.data.map(job => {
        //ajustes no job
        const remaining = Job.services.remainingDays(job)
        const status = remaining <= 0 ? 'done' : 'progress'

        return {
          // ... serve para espalhar as informações encontradas em um objeto já existente
          ...job,
          remaining,
          status,
          budget: Job.services.calculateBudget(job, profile.data['value-hour'])
        }
      })

      return res.render(views + 'index', { jobs: updatedJobs })
    },

    create(req, res) {
      return res.render(views + 'job')
    },

    save(req, res) {
      const lastId = Job.data[Job.data.length - 1]?.id || 0
      // ? = se existir, no caso de estar vazio, não existirá E || SIGNIFICA OU

      Job.data.push({
        id: lastId + 1,
        name: req.body.name,
        'daily-hours': req.body['daily-hours'],
        'total-hours': req.body['total-hours'],
        created_at: Date.now() // atribuindo a data de hoje
      })
      return res.redirect('/')
    },

    show(req, res) {
      //buscar o id de cada job
      const jobId = req.params.id

      //buscar cada id dentro do documento de acordo com o ID escolhido
      const job = Job.data.find(job => Number(job.id) === Number(jobId))

      // O ! é usado para negar a ação em questão... nesse caso, se NÃO encontrar o job
      if (!job) {
        return res.send('Job not found!')
      }

      job.budget = Job.services.calculateBudget(job, profile.data['value-hour'])

      return res.render(views + 'job-edit', { job })
    },

    update(req, res) {
      const jobId = req.params.id

      const job = Job.data.find(job => Number(job.id) === Number(jobId))

      if (!job) {
        return res.send('Job not found!')
      }

      const updatedJob = {
        ...job,
        name: req.body.name,
        'total-hours': req.body['total-hours'],
        'daily-hours': req.body['daily-hours']
      }

      Job.data = Job.data.map(job => {
        if (Number(job.id) === Number(jobId)) {
          job = updatedJob
        }

        return job
      })

      res.redirect('/job/' + jobId)
    },

    delete(req, res) {
      const jobId = req.params.id

      Job.data = Job.data.filter(job => Number(job.id) !== Number(jobId))

      return res.redirect('/')
    }
  },
  services: {
    remainingDays(job) {
      const remainingDays = (job['total-hours'] / job['daily-hours']).toFixed()

      //criando o prazo!
      const createdDate = new Date(job.created_at)
      const dueDay = createdDate.getDate() + Number(remainingDays)
      const deadline = createdDate.setDate(dueDay)

      // deadline será dada em milissegundos
      //aqui é calculada a diferença entre o dia que está e o prazo final
      const timeDiffInMs = deadline - Date.now()
      //transformando milissegundos em dias
      const dayInMs = 1000 * 60 * 60 * 24
      const dayDiff = Math.floor(timeDiffInMs / dayInMs)

      //restam x dias
      return dayDiff
    },
    calculateBudget: (job, valueHour) => valueHour * job['total-hours']
  }
}

//REQUEST AND RESPONSE AREA

//INDEX
routes.get('/', Job.controllers.index)
// JOBS
routes.get('/job', Job.controllers.create)
routes.post('/job', Job.controllers.save)
//JOB-EDIT
routes.get('/job/:id', Job.controllers.show)
routes.post('/job/:id', Job.controllers.update)
routes.post('/job/delete/:id', Job.controllers.delete)
//PROFILE
routes.get('/profile', profile.controllers.index)
routes.post('/profile', profile.controllers.update)

// ROUTES - AS ROTAS
module.exports = routes
