# API Specification Visualizer(Serval)

The API Specification Visualizer is a tool designed to simplify the visualization of API specifications, making it less tedious to learn how different parts of api specs are connected(especially when you’re just starting). The visualizer takes API specification files as input and generates a user-friendly graphical representation of the specification.

## Features

- Import API Specifications: The visualizer supports various API specifications, such as AsyncAPI, Postman Collection Format, OpenAPI (formerly Swagger), Github Action Spec and so much more. You can easily import your API specification files into the tool.

- Interactive Visualization: The visualizer provides an interactive and intuitive graphical representation of the API Specification. Names, Descriptions, Examples, and other essential details are visually presented for better understanding.

## Upcoming Features

- Search and Filtering: Quickly search for specific part of the spec or filter. This feature enhances the user experience when dealing with large API specifications.

- Ability to support very large API specifications

- Additional Panel to show the API specification JSON Schema

- Generating dummy APIs fronm the given specification

## Supported API Specification Formats

The API Specification Visualizer currently supports the following API specification formats:
`.json`


## Installation & Usage

The easiest way to use react-serval is to install it from npm and build it into your app with Webpack.

```
yarn add react-serval
```

Then use it in your app:

```js
import React, { useState } from 'react';
import Serval from 'react-serval';
import schema from '../config/2.6.0.json';

export default function App() {

  return (
    <div className="App">
        <Serval title="Name of Specification" description="Specification Description" schema={schema} />
    </div>
  );
}
```

## Props

Common props you may want to specify include:

- `title`: The title of the API specification, which will also be displayed on the initial node.

- `description`: The description of the API specification being parsed

- `schema`: The API specification schema which will be rendered on the visualizer.


## Contributing
We welcome contributions from the community! If you find a bug, have a feature request, or want to contribute in any way.


# Thanks

We would like to thank the contributors and supporters of the API Specification Visualizer project for their valuable contributions and feedback.

If you like React Serval, you should [follow me on Twitter](https://twitter.com/_acebuild)!

Shout out to the [AsyncAPI Community](https://github.com/asyncapi), [Lukasz Gornicki](https://github.com/derberg) who along with many other contributors have made this possible ❤️

Thank you for your interest in our API Specification Visualizer project! For more information or to report issues, please visit the [project repository](). Happy visualizing! 🚀

## License

Apache Liscence 2.0. Copyright (c) Azeez Elegbede 2023.