import React from 'react'

const PageNotFound = () => {
  return (
    <div>
      <h1>PageNotFound</h1>
      <img height={"500px"} width={"100%"} src="https://img.freepik.com/free-vector/404-error-with-landscape-concept-illustration_114360-7898.jpg"/>
      <span>{`${document.location.pathname}`} is not Found</span>
    </div>
  )
}

export default PageNotFound
