import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import userService from '../services/userService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import DocumentHead from '../components/common/DocumentHead'
import SafeImage from '../components/common/SafeImage'

const Home = () => {
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setUsersLoading(true)
      const response = await userService.getUsers(1, 10) // Get first 10 users for showcase
      setUsers(response.data.items || response.data || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setUsers([])
    } finally {
      setUsersLoading(false)
    }
  }

  return (
    <>
      <DocumentHead 
        title="Taskly App - Manage Your Tasks Efficiently"
        description="Organize, prioritize, and accomplish more every day with Taskly. Experience a streamlined workflow designed to boost your productivity."
        keywords="task management, productivity, workflow, organization, goals"
      />
      
      <div className="home">
        {/* Hero Section with Main Image */}
        <section>
          <div className="bloc l-bloc none full-width-bloc" id="bloc-1">
            <div className="container bloc-no-padding bloc-no-padding-lg">
              <div className="row g-0">
                <div className="col-md-12 col-lg-12 offset-lg-0 text-lg-start">
                  <SafeImage
                    src="/img/task--main.jpg"
                    fallbackSrc="/img/placeholder-user.png"
                    className="img-fluid mx-auto d-block lazyload" 
                    alt="task main" 
                    width="2240" 
                    height="1484"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* First Quote Section - Seneca */}
        <section>
          <div className="bloc l-bloc none" id="bloc-2">
            <div className="container bloc-lg bloc-md-lg">
              <div className="row justify-content-center">
                <div className="text-center w-100">
                  <h3 className="display-6 fw-bold mb-3 text-wrap">
                    <span className="fa fa-quote-left text-dark me-2"></span>
                    It is not that we have a short time to live, but that we waste a lot of it. Life is long
                    enough, and a generous enough amount has been given to us for the highest achievements
                    if it were all well invested. But when it is wasted in heedless luxury and spent on no good
                    activity, we are forced at last by death's final constraint to realize that it has passed
                    away before we knew it was passing.
                    <span className="fa fa-quote-right text-dark ms-2"></span>
                  </h3>
                  <h4 className="fw-semibold text-dark">
                    — Seneca
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section 1 - Seamless Task Management */}
        <section>
          <div className="bloc l-bloc full-width-bloc" id="bloc-3">
            <div className="container bloc-no-padding">
              <div className="row g-0">
                <div className="col-md-12 offset-lg--1 col-lg-6">
                  <SafeImage
                    src="/img/sidebar-task-1.jpg"
                    fallbackSrc="/img/placeholder-user.png"
                    className="img-fluid mx-auto d-block lazyload" 
                    alt="task-management" 
                    width="1120"
                    height="742"
                  />
                </div>
                <div className="align-self-center offset-md-1 col-md-10 col-sm-10 offset-sm-1 offset-1 col-10 offset-lg-1 col-lg-4">
                  <h2 className="mg-md fw-bold display-5 text-secondary mb-3">
                    Seamless Task Management
                  </h2>
                  <h3 className="mg-md fw-semibold text-muted mb-2">
                    Organize, prioritize, and accomplish more every day.
                  </h3>
                  <p className="lead text-dark lh-base">
                    <strong className="text-brand">Taskly</strong> empowers you to track your tasks, set clear
                    priorities, and stay focused on what matters most.
                    <span className="text-highlight"> Experience a streamlined workflow</span> designed to boost your
                    productivity and help you achieve your goals efficiently.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section 2 - Organize Your Workflow */}
        <section>
          <div className="bloc l-bloc none full-width-bloc" id="bloc-4">
            <div className="container bloc-no-padding">
              <div className="row g-0">
                <div className="order-md-0 col-md-12 col-lg-6 order-lg-1 offset-lg-1">
                  <SafeImage
                    src="/img/sidebar-task-2.jpg"
                    fallbackSrc="/img/placeholder-user.png"
                    className="img-fluid mx-auto d-block lazyload" 
                    alt="organize-task" 
                    width="1120"
                    height="742"
                  />
                </div>
                <div className="align-self-center offset-md-1 col-md-10 col-lg-4 col-sm-10 offset-sm-1 col-10 offset-1">
                  <h2 className="mg-md fw-bold display-5 text-secondary mb-3">
                    Organize Your Workflow
                  </h2>
                  <h3 className="mg-md fw-semibold text-muted mb-2">
                    Stay productive and focused with <span className="text-brand">Taskly</span>.
                  </h3>
                  <p className="lead text-dark lh-base">
                    <strong>Taskly</strong> helps you manage your daily tasks efficiently, prioritize what
                    matters most, and achieve your goals with ease. 
                    <span className="text-highlight"> Simplify your workflow</span> and
                    make every day more productive.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Users Showcase Section */}
        <section>
          <div className="bloc l-bloc" id="bloc-5">
            <div className="container bloc-lg bloc-md-lg">
              <div className="row">
                <div className="col-md-12 col-lg-6 offset-lg-3">
                  <h2 className="display-6 fw-bold text-center mb-2">
                    View Users
                  </h2>
                  <p className="lead text-center mb-4">
                    Explore our active users and their productivity stats below.
                  </p>
                </div>
              </div>
              <div className="row">
                {usersLoading ? (
                  <div className="col-12 text-center">
                    <LoadingSpinner size="medium" />
                  </div>
                ) : users && users.length > 0 ? (
                  users.map(user => (
                    <div key={user._id || user.id} className="col-md-6">
                      <div className="row voffset align-items-center">
                        <div className="col-lg-3">
                          <SafeImage
                            src={user.avatar || '/img/placeholder-user.png'}
                            fallbackSrc="/img/placeholder-user.png"
                            className="img-fluid rounded-circle lazyload"
                            alt={`${user.fullname || 'User Name'}'s Avatar`}
                            width="122" 
                            height="122"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <div className="col">
                          <h4 className="fw-semibold text-secondary mb-1 text-lg-start text-center">
                            <Link to={`/users/${user._id || user.id}`}>
                              {user.fullname || "User Name"}
                            </Link>
                          </h4>
                          <p className="mb-2 lh-sm text-lg-start text-center">
                            <span className="fw-medium">Task Completion Rate:</span>{' '}
                            {user.stats?.completionRate !== undefined ? `${user.stats.completionRate}%` : 'N/A'}<br />
                            <span className="fw-medium">Failed Tasks:</span>{' '}
                            {user.stats?.failed || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <p className="text-center text-muted fs-5">
                      No users found. Be the first to join Taskly!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Second Quote Section - James Clear */}
        <section>
          <div className="bloc l-bloc" id="bloc-6">
            <div className="container bloc-sm">
              <div className="row justify-content-center">
                <div className="text-center w-100">
                  <h2 className="display-6 fw-bold mb-3 text-wrap">
                    <span className="fa fa-quote-left text-dark me-2"></span>
                    You do not rise to the level of your goals. You fall to the level of your systems. Goals
                    are good for setting direction, but systems are best for making progress. You should be far
                    more concerned with your current trajectory than with your current results.
                    <span className="fa fa-quote-right text-dark ms-2"></span>
                  </h2>
                  <h4 className="fw-semibold text-dark">
                    — James Clear
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Home