var cluster = require('cluster')
  , cpus = require('os').cpus()
  , _ = require('lodash')

module.exports = function (clusterFn, opts) {
  var options = _.extend(
    { size: cpus.length // Default to the number of CPUs
    , logger: console
    }, opts)

  // Cluster is used in all but the development environment
  if ((process.env.NODE_ENV !== undefined) && (cluster.isMaster)) {

    options.logger.info('Forking ' + options.size + ' cluster process, one per CPU')

    // Create one instance of the app (i.e. one process) per CPU
    for (var i = 0; i < options.size; i += 1) {
      cluster.fork()
    }

    // Report child process death
    cluster.on('exit', function (worker) {
      options.logger.error('Worker ' + worker.process.pid + ' died', worker)

      if (worker.process.signalCode === null) {
        cluster.fork()
      } else {
        options.logger.error('Not forking new process because ' + worker.process.signalCode + ' was given')
      }

    })

  } else {
    options.logger.info('Running in PID ' + process.pid)
    clusterFn()
  }
}