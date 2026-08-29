import type {
  RXSectorsOperation,
} from "./sectors-operation";

import type {
  RXSectorsOperationParamsMap,
} from "./sectors-operation-params";

export type RXSectorsTypedOperationRequest = {
  [TOperation in RXSectorsOperation]: {
    operation: TOperation;
    params:
      RXSectorsOperationParamsMap[TOperation];

    /**
     * Every operation must answer a concrete
     * investigation question.
     */
    purpose: string;
  };
}[RXSectorsOperation];