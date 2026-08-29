import { BPModule, bp } from "BPEngine";
import { ViewConfig } from "../../Config/ViewConfig";
import { ViewDefine } from "../ViewDefine";

export class TestEntity extends BPModule.BPEntityBase {
    panel = {

    }

    cache = {

    }

    model = {

    }

    custom = {

    }
}

export class TestSystem extends BPModule.BPSystemBase<TestEntity> {
    override onLoad(): void {
        super.onLoad();

    }

    override onStart(): void {
        bp.log.logic("TestSystem onStart ...");
    }
}

ViewConfig.push({
    viewName: ViewDefine.TestView,
    viewUrl: "Test:" + ViewDefine.TestView,
    systemClass: TestSystem,
    entityClass: TestEntity,
    useMask: true,
});
