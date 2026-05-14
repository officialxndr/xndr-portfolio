import { useState, useEffect } from 'react'

export function useProjects(publishedOnly = true) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const url = publishedOnly ? '/api/projects?published=1' : '/api/projects'
      const res = await fetch(url)
      const data = await res.json()
      setProjects(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, [publishedOnly])

  return { projects, loading, error, refetch: fetchProjects }
}

export function useProject(id) {
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/projects/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => { setProject(data); setLoading(false) })
      .catch(err => { setError(err); setLoading(false) })
  }, [id])

  return { project, loading, error }
}

export function useSiteConfig() {
  const [config, setConfig] = useState({})

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(setConfig)
      .catch(() => {})
  }, [])

  return config
}
