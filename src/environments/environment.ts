// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'https://ventas-vittoria-api-test.crediventa.com',
  apiUrlServientrega: 'https://181.39.87.158:8021',
  // apiUrl: 'http://127.0.0.1:8000',
  setKey: '6Le9XCgpAAAAAGLvVLmTUsLr057fNVB6J1-ejMum',
  roles: {
    rol: {
      id: 0,
      codigo: '',
      nombre: '',
      descripcion: ''
    },
    acciones: {
      ADM: {
        LEER: 0,
        ESCRIBIR: 0,
        CREAR: 0,
        BORRAR: 0
      },
      MDM: {
        LEER: 0,
        ESCRIBIR: 0,
        CREAR: 0,
        BORRAR: 0
      },
      MDP: {
        LEER: 0,
        ESCRIBIR: 0,
        CREAR: 0,
        BORRAR: 0
      },
      MDO: {
        LEER: 0,
        ESCRIBIR: 0,
        CREAR: 0,
        BORRAR: 0
      },
      GDO: {
        LEER: 0,
        ESCRIBIR: 0,
        CREAR: 0,
        BORRAR: 0
      },
      GDE: {
        LEER: 0,
        ESCRIBIR: 0,
        CREAR: 0,
        BORRAR: 0
      },
      SERVI: {
        LEER: 0,
        ESCRIBIR: 0,
        CREAR: 0,
        BORRAR: 0
      },
    }

  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
