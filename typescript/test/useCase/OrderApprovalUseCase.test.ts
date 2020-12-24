import Order from "../../src/domain/Order";
import OrderStatus from "../../src/domain/OrderStatus"
import OrderApprovalRequest from "../../src/useCase/OrderApprovalRequest";
import TestOrderRepository from "../doubles/TestOrderRepository";
import OrderApprovalUseCase from "../../src/useCase/OrderApprovalUseCase";
import RejectedOrderCannotBeApprovedException from "../../src/useCase/RejectedOrderCannotBeApprovedException";
import ApprovedOrderCannotBeRejectedError from "../../src/useCase/ApprovedOrderCannotBeRejectedError";
import ShippedOrdersCannotBeChangedException from "../../src/useCase/ShippedOrdersCannotBeChangedException";

function createOrder(id: number, status: OrderStatus) {
    return new Order(id, status);
}

describe('OrderApprovalUseCase should', () => {
    let orderRepository: TestOrderRepository;
    let useCase: OrderApprovalUseCase;

    beforeEach(() => {
        orderRepository = new TestOrderRepository();
        useCase = new OrderApprovalUseCase(orderRepository);
    });

    test('approve existing order', () => {
        let initialOrder = createOrder(1, OrderStatus.CREATED);
        orderRepository.addOrder(initialOrder);

        let request = new OrderApprovalRequest(1, true);

        useCase.run(request);

        const savedOrder = orderRepository.getSavedOrder();
        expect(savedOrder.status).toBe(OrderStatus.APPROVED);
    });

    test('reject existing order', () => {
        let initialOrder = createOrder(1, OrderStatus.CREATED);
        orderRepository.addOrder(initialOrder);

        let request = new OrderApprovalRequest(1, false);

        useCase.run(request);

        const savedOrder = orderRepository.getSavedOrder();
        expect(savedOrder.status).toBe(OrderStatus.REJECTED);
    });

    test('not approve rejected order', () => {
        let initialOrder = createOrder(1, OrderStatus.REJECTED);
        orderRepository.addOrder(initialOrder);

        let request = new OrderApprovalRequest(1, true);

        expect(() => {useCase.run(request)}).toThrowError(RejectedOrderCannotBeApprovedException);
        expect(orderRepository.getSavedOrder()).toBeUndefined();
    });

    test('not reject approved order', () => {
        let initialOrder = createOrder(1, OrderStatus.APPROVED);
        orderRepository.addOrder(initialOrder);

        let request = new OrderApprovalRequest(1, false);

        expect(() => {useCase.run(request)}).toThrowError(ApprovedOrderCannotBeRejectedError);
        expect(orderRepository.getSavedOrder()).toBeUndefined();
    });

    test('not approve shipped orders', () => {
        let initialOrder = createOrder(1, OrderStatus.SHIPPED);
        orderRepository.addOrder(initialOrder);

        let request = new OrderApprovalRequest(1, true);

        expect(() => {useCase.run(request)}).toThrowError(ShippedOrdersCannotBeChangedException);
        expect(orderRepository.getSavedOrder()).toBeUndefined();
    });

    test('not reject shipped orders', () => {
        let initialOrder = createOrder(1, OrderStatus.SHIPPED);
        orderRepository.addOrder(initialOrder);

        let request = new OrderApprovalRequest(1, false);

        expect(() => {useCase.run(request)}).toThrowError(ShippedOrdersCannotBeChangedException);
        expect(orderRepository.getSavedOrder()).toBeUndefined();
    });

});
