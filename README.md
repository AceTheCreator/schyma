# JSON Schema Visualizer(Schyma)

Schyma is a tool designed to simplify the visualization of JSON Schemas, making it less tedious to learn how different parts of api specs are connected(especially when you’re just starting). The visualizer takes JSON Schema files as input and generates a user-friendly graphical representation of the specification.

## Features

- Import JSON Schemas: The visualizer supports various JSON Schemas, such as AsyncAPI, Postman Collection Format, OpenAPI (formerly Swagger), Github Action Spec and so much more. You can easily import your JSON Schema files into the tool.

- Interactive Visualization: The visualizer provides an interactive and intuitive graphical representation of the JSON Schema. Names, Descriptions, Examples, and other essential details are visually presented for better understanding.

## Upcoming Features

- Search and Filtering: Quickly search for specific part of the spec or filter. This feature enhances the user experience when dealing with large JSON Schemas.

- Ability to support very large JSON Schemas

- Additional Panel to render selected Node Schema

- Generating dummy APIs fronm the given specification

## Supported JSON Schema Formats

The JSON Schema Visualizer currently supports the following JSON Schema formats:
`.json`


## Installation & Usage

The easiest way to use schyma is to install it from npm and build it into your app with Webpack.

```
npm install schyma
```

Then use it in your app:

```js
import React from 'react';
import Schyma from 'schyma';
import 'schyma/src/style.css'
import schema from '../config/2.6.0.json';

export default function App() {

  return (
    <div className="App">
        <Schyma title="Name of Specification" description="Specification Description" schema={schema} />
    </div>
  );
}
```

## Props

Common props you may want to specify include:

- `title`: The title of the JSON Schema, which will also be displayed on the initial node.

- `description`: The description of the JSON Schema being parsed

- `schema`: The JSON Schema schema which will be rendered on the visualizer.


## Contributing
We welcome contributions from the community! If you find a bug, have a feature request, or want to contribute in any way.


# Thanks

We would like to thank the contributors and supporters of the JSON Schema Visualizer project for their valuable contributions and feedback.

If you like Schyma, you should [follow me on Twitter](https://twitter.com/_acebuild)!

Shout out to the [AsyncAPI Community](https://github.com/asyncapi), [Lukasz Gornicki](https://github.com/derberg) who along with many other contributors have made this possible ❤️

Thank you for your interest in our JSON Schema Visualizer project! For more information or to report issues, please visit the [project repository](). Happy visualizing! 🚀

## License

Apache Liscence 2.0. Copyright (c) Azeez Elegbede 2024.