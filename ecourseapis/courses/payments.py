#Sử dụng strategy pattern cho thanh toán
from abc import ABC, abstractmethod
from courses.models import Payment, Enrollment


class PaymentStrategy(ABC):
    @abstractmethod
    def process_payment(self, enrollment, amount):
        pass


class CashPaymentStrategy(PaymentStrategy):
    def process_payment(self, enrollment, amount):
        pass

class MoMoPaymentStrategy(PaymentStrategy):
    def process_payment(self, enrollment, amount):
        pass

# class ZaloPayPaymentStrategy(PaymentStrategy):
#     def process_payment(self, enrollment, amount):
#         pass
#
# class PayPalPaymentStrategy(PaymentStrategy):
#     def process_payment(self, enrollment, amount):
#         pass


class PaymentFactory:
    @staticmethod
    def get_payment_strategy(payment_method):
        strategies = {
            'CASH': CashPaymentStrategy(),
            'MOMO': MoMoPaymentStrategy(),
            # 'ZALOPAY': ZaloPayPaymentStrategy(),
            # 'PAYPAL': PayPalPaymentStrategy(),
        }
        strategy = strategies.get(payment_method)
        if not strategy:
            raise ValueError(f"Phương thức thanh toán {payment_method} chưa được hỗ trợ.")
        return strategy